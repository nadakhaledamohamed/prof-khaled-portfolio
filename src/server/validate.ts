import { z } from "zod";
import { defaultContent } from "@/content";
import type { TextSectionKey } from "@/content/types";

/* ---------- Text sections: must keep the shape of the bundled dictionaries ---------- */

const MAX_TEXT = 6000;
/** Arrays whose length is part of the layout and must not change. */
const FIXED_LENGTH = new Set(["miniLabels"]);

/**
 * Checks `value` against the shape of `template`: same object keys, same primitive types,
 * arrays whose items match the template's first item. Returns an error path or null.
 */
function conform(template: unknown, value: unknown, path: string): string | null {
  if (typeof template === "string") {
    if (typeof value !== "string") return `${path} must be text`;
    if (value.length > MAX_TEXT) return `${path} is too long`;
    return null;
  }
  if (typeof template === "number") return typeof value === "number" && Number.isFinite(value) ? null : `${path} must be a number`;
  if (typeof template === "boolean") return typeof value === "boolean" ? null : `${path} must be true or false`;

  if (Array.isArray(template)) {
    if (!Array.isArray(value)) return `${path} must be a list`;
    if (value.length > 200) return `${path} has too many items`;
    const key = path.split(".").pop() ?? "";
    if (FIXED_LENGTH.has(key) && value.length !== template.length) {
      return `${path} must have exactly ${template.length} items`;
    }
    const itemTemplate = template[0];
    for (let i = 0; i < value.length; i++) {
      const error =
        itemTemplate === undefined
          ? plainRecord(value[i], `${path}[${i}]`)
          : conform(itemTemplate, value[i], `${path}[${i}]`);
      if (error) return error;
    }
    return null;
  }

  if (template !== null && typeof template === "object") {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return `${path} must be a group`;
    const record = value as Record<string, unknown>;
    for (const [key, sub] of Object.entries(template as Record<string, unknown>)) {
      if (!(key in record)) {
        // Optional fields (e.g. `featured`, `note`) may be absent.
        continue;
      }
      const error = conform(sub, record[key], `${path}.${key}`);
      if (error) return error;
    }
    for (const key of Object.keys(record)) {
      if (!(key in (template as Record<string, unknown>)) && !OPTIONAL_KEYS.has(key)) {
        return `${path}.${key} is not a known field`;
      }
    }
    return null;
  }
  return null;
}

/** Keys that are optional on some list items and may be missing from the template item. */
const OPTIONAL_KEYS = new Set(["featured", "year", "location", "note", "description", "suffix"]);

/** Items of lists that ship empty (testimonials): flat objects with text values. */
function plainRecord(value: unknown, path: string): string | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return `${path} must be a group`;
  for (const [key, field] of Object.entries(value)) {
    if (typeof field !== "string" || field.length > MAX_TEXT) return `${path}.${key} must be text`;
  }
  return null;
}

export const textSectionKeys = Object.keys(defaultContent.en).filter(
  (key) => key !== "locale",
) as TextSectionKey[];

export function validateTextSection(key: string, en: unknown, ar: unknown): string | null {
  if (!textSectionKeys.includes(key as TextSectionKey)) return "Unknown section.";
  const k = key as TextSectionKey;
  return conform(defaultContent.en[k], en, `English ${k}`) ?? conform(defaultContent.ar[k], ar, `Arabic ${k}`);
}

/* ---------- Data sections ---------- */

const link = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v), {
    message: "Links must start with / or http(s)://",
  });
const requiredLink = link.refine((v) => v.length > 0, { message: "This link is required" });
const optionalLink = z.preprocess((v) => (v === "" ? null : v), link.nullable());
const id = z.string().trim().min(1).max(80);
const text = (max: number) => z.string().trim().max(max);
const requiredText = (max: number, label: string) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);

export const dataSchemas = {
  profile: z.object({
    links: z.object({
      photo: requiredLink,
      cv: requiredLink,
      scholar: link,
      fayoum: link,
      mbrf: link,
    }),
    verifiedDomain: text(120),
    metrics: z
      .array(
        z.object({
          id: z.enum(["citations", "h-index", "i10-index", "years"]),
          value: z.number().int().min(0).max(1_000_000),
          suffix: z.string().max(4).optional(),
        }),
      )
      .length(4),
  }),
  books: z
    .array(
      z.object({
        id,
        title: requiredText(300, "Title"),
        titleAr: z.preprocess((v) => (v === "" ? null : v), text(300).nullable()),
        publisher: text(300),
        publisherAr: text(300),
        year: z.number().int().min(1900).max(2100).nullable(),
        language: z.enum(["ar", "en"]),
        cover: requiredLink,
        pdf: optionalLink,
        url: optionalLink,
      }),
    )
    .max(200),
  publications: z
    .array(
      z.object({
        id,
        title: requiredText(500, "Title"),
        authors: requiredText(500, "Authors"),
        venue: text(500),
        year: z.number().int().min(1900).max(2100),
        citations: z.number().int().min(0).max(1_000_000),
        category: z.enum(["retrieval", "libraries", "other"]),
      }),
    )
    .max(1000),
  collaborators: z
    .array(
      z.object({
        id,
        name: requiredText(150, "Name"),
        affiliationEn: text(200),
        affiliationAr: text(200),
      }),
    )
    .max(100),
  gallery: z
    .array(
      z.object({
        id,
        type: z.enum(["image", "pdf"]),
        src: requiredLink,
        titleEn: requiredText(300, "English title"),
        titleAr: text(300),
        captionEn: text(300),
        captionAr: text(300),
      }),
    )
    .max(300),
};

export type DataSectionKey = keyof typeof dataSchemas;

export function isDataSection(key: string): key is DataSectionKey {
  return key in dataSchemas;
}

export function describeZodError(error: z.ZodError) {
  const issue = error.issues[0];
  if (!issue) return "Invalid data.";
  const where = issue.path
    .map((part) => (typeof part === "number" ? `item ${part + 1}` : String(part)))
    .join(" › ");
  return where ? `${where}: ${issue.message}` : issue.message;
}

/** New admin password rules. */
export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(200, "Password is too long.");
