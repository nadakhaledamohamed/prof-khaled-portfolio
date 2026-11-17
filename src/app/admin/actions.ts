"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SiteContent, TextSectionKey } from "@/content/types";
import {
  clearLoginFailures,
  endSession,
  findAdminById,
  findAdminByUsername,
  loginBlocked,
  recordLoginFailure,
  requireAdmin,
  startSession,
  updateAdminPassword,
  verifyAspNetHash,
} from "@/server/auth";
import { readSiteContent, writeSiteContent } from "@/server/content";
import { deleteMedia, saveUpload, UploadError, type UploadKind } from "@/server/media";
import { removeMessage, setMessageRead } from "@/server/messages";
import {
  dataSchemas,
  describeZodError,
  isDataSection,
  passwordSchema,
  validateTextSection,
} from "@/server/validate";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

function failure(error: unknown, fallback: string): ActionResult {
  console.error("[admin]", error);
  return { ok: false, error: fallback };
}

/* ---------- Session ---------- */

export interface LoginState {
  error?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  if (!username || !password) return { error: "Enter your username and password." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${ip}:${username.toLowerCase()}`;
  if (loginBlocked(key)) {
    return { error: "Too many failed attempts. Please wait 15 minutes and try again." };
  }

  let user;
  try {
    user = await findAdminByUsername(username);
  } catch (error) {
    console.error("[admin] login lookup failed", error);
    return { error: "The database is not reachable. Check that SQL Server is running." };
  }

  if (!user || !verifyAspNetHash(password, user.PasswordHash)) {
    recordLoginFailure(key);
    return { error: "Invalid username or password." };
  }

  clearLoginFailures(key);
  await startSession({ id: user.Id, username: user.Username }, remember);
  redirect("/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/login");
}

/* ---------- Content ---------- */

async function updateContent(mutate: (content: SiteContent) => void, who: string) {
  const { content } = await readSiteContent();
  const next = structuredClone(content);
  mutate(next);
  await writeSiteContent(next, who);
}

export async function saveTextSection(key: string, en: unknown, ar: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const error = validateTextSection(key, en, ar);
  if (error) return { ok: false, error };

  try {
    await updateContent((content) => {
      const k = key as TextSectionKey;
      (content.en as unknown as Record<string, unknown>)[k] = en;
      (content.ar as unknown as Record<string, unknown>)[k] = ar;
    }, admin.username);
    return { ok: true, message: "Saved. The live site is updated." };
  } catch (err) {
    return failure(err, "Could not save. Check the database connection and try again.");
  }
}

export async function saveDataSection(key: string, value: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!isDataSection(key)) return { ok: false, error: "Unknown section." };

  const parsed = dataSchemas[key].safeParse(value);
  if (!parsed.success) return { ok: false, error: describeZodError(parsed.error) };

  try {
    await updateContent((content) => {
      if (key === "profile") {
        const profile = parsed.data as {
          links: SiteContent["data"]["links"];
          verifiedDomain: string;
          metrics: SiteContent["data"]["metrics"];
        };
        content.data.links = profile.links;
        content.data.verifiedDomain = profile.verifiedDomain;
        content.data.metrics = profile.metrics;
      } else {
        (content.data as unknown as Record<string, unknown>)[key] = parsed.data;
      }
    }, admin.username);
    return { ok: true, message: "Saved. The live site is updated." };
  } catch (err) {
    return failure(err, "Could not save. Check the database connection and try again.");
  }
}

/* ---------- Media ---------- */

export type UploadResult = { ok: true; url: string; name: string } | { ok: false; error: string };

export async function uploadMediaAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  const file = formData.get("file");
  const acceptRaw = String(formData.get("accept") ?? "any");
  const accept: UploadKind = acceptRaw === "image" || acceptRaw === "pdf" ? acceptRaw : "any";
  if (!(file instanceof File)) return { ok: false, error: "Choose a file to upload." };

  try {
    const saved = await saveUpload(file, accept);
    revalidatePath("/admin/media");
    return { ok: true, url: saved.url, name: saved.name };
  } catch (error) {
    if (error instanceof UploadError) return { ok: false, error: error.message };
    console.error("[admin] upload failed", error);
    return { ok: false, error: "Upload failed. Please try again." };
  }
}

export async function deleteMediaAction(id: number): Promise<ActionResult> {
  await requireAdmin();
  try {
    await deleteMedia(id);
    revalidatePath("/admin/media");
    return { ok: true, message: "File deleted." };
  } catch (err) {
    return failure(err, "Could not delete the file.");
  }
}

/* ---------- Messages ---------- */

export async function markMessageAction(id: number, read: boolean): Promise<ActionResult> {
  await requireAdmin();
  try {
    await setMessageRead(id, read);
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return failure(err, "Could not update the message.");
  }
}

export async function deleteMessageAction(id: number): Promise<ActionResult> {
  await requireAdmin();
  try {
    await removeMessage(id);
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Message deleted." };
  } catch (err) {
    return failure(err, "Could not delete the message.");
  }
}

/* ---------- Account ---------- */

export interface PasswordState {
  ok?: boolean;
  error?: string;
}

export async function changePasswordAction(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const admin = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const rules = passwordSchema.safeParse(next);
  if (!rules.success) return { error: rules.error.issues[0]?.message ?? "Invalid password." };
  if (next !== confirm) return { error: "The new passwords do not match." };

  try {
    const user = await findAdminById(admin.id);
    if (!user || !verifyAspNetHash(current, user.PasswordHash)) {
      return { error: "Your current password is not correct." };
    }
    await updateAdminPassword(admin.id, next);
    return { ok: true };
  } catch (err) {
    console.error("[admin] password change failed", err);
    return { error: "Could not update the password. Please try again." };
  }
}
