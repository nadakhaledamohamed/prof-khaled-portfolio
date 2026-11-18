import { NextResponse } from "next/server";
import { validateContact, type ContactResultCode } from "@/lib/contact-schema";
import { saveMessage } from "@/server/messages";

export const runtime = "nodejs";

/**
 * Contact form endpoint. Responses carry language-neutral codes; the page translates them.
 *
 * Every message is stored in the database (WebMessages) and shown in the admin inbox.
 * It is also emailed through Resend (https://resend.com) when these are set:
 *   RESEND_API_KEY      – API key
 *   CONTACT_TO_EMAIL    – inbox that receives messages
 *   CONTACT_FROM_EMAIL  – verified sender (optional)
 */
function reply(code: ContactResultCode, status = 200, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: status < 300, code, ...extra }, { status });
}

/* Simple per-process rate limit: 5 messages per IP every 10 minutes. */
const recent = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const windowStart = now - 10 * 60_000;
  const hits = (recent.get(ip) ?? []).filter((t) => t > windowStart);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > 5;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return reply("invalid_request", 400);
  }

  const result = validateContact(payload);
  if (!result.ok) {
    // A filled honeypot fails validation with no field errors: answer as if sent so bots learn nothing.
    if (Object.keys(result.errors).length === 0) return reply("sent");
    return reply("invalid_fields", 422, { errors: result.errors });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return reply("unknown", 429);

  const { name, email, subject, message } = result.data;
  const rawLocale = (payload as { locale?: unknown }).locale;
  const locale = rawLocale === "ar" || rawLocale === "en" ? rawLocale : undefined;

  let stored = false;
  try {
    const { kind, phone, organization, consultType } = result.data;
    await saveMessage({
      kind: kind ?? "contact",
      name,
      email,
      subject,
      message,
      locale,
      phone,
      organization,
      consultType,
    });
    stored = true;
  } catch (error) {
    console.error("[contact] could not store message:", error instanceof Error ? error.message : error);
  }

  let emailed = false;
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (apiKey && to) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio contact <onboarding@resend.dev>",
        to: [to],
        reply_to: email,
        subject: `[Portfolio] ${subject}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      }),
    }).catch(() => null);
    emailed = Boolean(response?.ok);
    if (!emailed) console.error("[contact] email delivery failed", response?.status);
  }

  if (stored || emailed) return reply("sent");
  if (process.env.NODE_ENV !== "production") {
    console.info("[contact] (not stored, not emailed)", { name, email, subject, message });
    return reply("dev_logged");
  }
  return reply(apiKey && to ? "delivery_failed" : "unavailable", 503);
}
