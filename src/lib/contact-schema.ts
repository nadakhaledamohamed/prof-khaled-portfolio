import { z } from "zod";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Error codes are translated on the client, so the server stays language-neutral. */
export const contactErrorCodes = [
  "name_required",
  "name_long",
  "email_required",
  "email_long",
  "email_invalid",
  "subject_required",
  "subject_long",
  "message_short",
  "message_long",
] as const;
export type ContactErrorCode = (typeof contactErrorCodes)[number];

export type ContactResultCode =
  | "sent"
  | "dev_logged"
  | "invalid_request"
  | "invalid_fields"
  | "unavailable"
  | "delivery_failed"
  | "network"
  | "unknown";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "name_required").max(80, "name_long"),
  email: z
    .string()
    .trim()
    .min(1, "email_required")
    .max(120, "email_long")
    .regex(EMAIL, "email_invalid"),
  subject: z.string().trim().min(3, "subject_required").max(120, "subject_long"),
  message: z.string().trim().min(20, "message_short").max(3000, "message_long"),
  /** Honeypot — real visitors never fill this in. */
  company: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactField = "name" | "email" | "subject" | "message";
export type ContactErrors = Partial<Record<ContactField, ContactErrorCode>>;

const fields: ContactField[] = ["name", "email", "subject", "message"];
const requiredCode: Record<ContactField, ContactErrorCode> = {
  name: "name_required",
  email: "email_required",
  subject: "subject_required",
  message: "message_short",
};

function isCode(value: string): value is ContactErrorCode {
  return (contactErrorCodes as readonly string[]).includes(value);
}

export function validateContact(input: unknown):
  | { ok: true; data: ContactInput }
  | { ok: false; errors: ContactErrors } {
  const parsed = contactSchema.safeParse(input);
  if (parsed.success) return { ok: true, data: parsed.data };

  const errors: ContactErrors = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as ContactField | undefined;
    if (!field || !fields.includes(field) || errors[field]) continue;
    // Type errors (e.g. a missing field) carry zod's own message; treat them as "required".
    errors[field] = isCode(issue.message) ? issue.message : requiredCode[field];
  }
  return { ok: false, errors };
}
