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

const year = z.number().int().min(1900).max(2100);
const longText = (max: number) => z.string().max(max);
const optionalAsset = z.preprocess((v) => (v === "" ? null : v), link.nullable());

export const dataSchemas = {
  profile: z.object({
    links: z.object({
      photo: requiredLink,
      banner: link,
      cv: requiredLink,
      scholar: link,
      fayoum: link,
      mbrf: link,
      linkedin: link,
      facebook: link,
      email: z.string().trim().max(150).refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), { message: "Enter a valid email address" }),
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
    metricsSince: z.object({
      year,
      citations: z.number().int().min(0).max(1_000_000),
      h: z.number().int().min(0).max(10_000),
      i10: z.number().int().min(0).max(10_000),
      updated: text(20),
    }),
  }),
  books: z
    .array(
      z.object({
        id,
        title: requiredText(300, "Title"),
        titleAr: z.preprocess((v) => (v === "" ? null : v), text(300).nullable()),
        authorsEn: text(500),
        authorsAr: text(500),
        publisher: text(300),
        publisherAr: text(300),
        year: year.nullable(),
        language: z.enum(["ar", "en"]),
        cover: requiredLink,
        isbn: text(40),
        summaryEn: longText(3000),
        summaryAr: longText(3000),
        citations: z.number().int().min(0).max(1_000_000).nullable(),
        pdf: optionalAsset,
        ebook: optionalAsset,
        toc: longText(30_000),
        tocOffset: z.number().int().min(-500).max(500),
        url: optionalLink,
      }),
    )
    .max(200),
  publications: z
    .array(
      z.object({
        id,
        kind: z.enum(["paper", "study"]),
        title: requiredText(500, "Title"),
        titleAr: text(500),
        authors: text(500),
        authorsAr: text(500),
        venue: text(500),
        venueAr: text(500),
        year: z.number().int().min(0).max(2100),
        citations: z.number().int().min(0).max(1_000_000),
        category: z.enum(["retrieval", "libraries", "other"]),
        link: optionalLink,
        ident: text(80),
        abstractAr: longText(100_000),
      }),
    )
    .max(1000),
  articles: z
    .array(
      z.object({
        id,
        titleEn: text(300),
        titleAr: requiredText(300, "Arabic title"),
        summaryEn: longText(3000),
        summaryAr: longText(3000),
        bodyAr: longText(200_000),
        date: text(20),
        image: optionalAsset,
        link: optionalLink,
        venueEn: text(300),
        venueAr: text(300),
      }),
    )
    .max(500),
  talks: z
    .array(
      z.object({
        id,
        track: z.enum(["course", "talk"]),
        titleEn: text(300),
        titleAr: requiredText(300, "Arabic title"),
        summaryEn: longText(3000),
        summaryAr: longText(3000),
        eventEn: text(300),
        eventAr: text(300),
        placeEn: text(300),
        placeAr: text(300),
        outlineAr: longText(10_000),
        image: optionalAsset,
        lectures: z
          .array(
            z.object({
              titleEn: text(300),
              titleAr: text(300),
              file: optionalAsset,
              pages: z.number().int().min(0).max(5000),
            }),
          )
          .max(100),
      }),
    )
    .max(300),
  videos: z
    .array(
      z.object({
        id,
        titleEn: text(300),
        titleAr: requiredText(300, "Arabic title"),
        summaryEn: longText(2000),
        summaryAr: longText(2000),
        eventEn: text(300),
        eventAr: text(300),
        link: requiredLink,
        image: optionalAsset,
        date: text(20),
      }),
    )
    .max(300),
  systems: z
    .array(
      z.object({
        id,
        num: z.number().int().min(0).max(1000),
        nameEn: requiredText(200, "Name"),
        nameAr: text(200),
        fullNameEn: text(300),
        fullNameAr: text(300),
        cats: z.array(z.enum(["ils", "repo", "access"])).max(3),
        license: z.enum(["open", "commercial", "platform", "other"]),
        link,
        date: text(20),
        funcEn: longText(2000), funcAr: longText(2000),
        useEn: longText(2000), useAr: longText(2000),
        perfEn: longText(2000), perfAr: longText(2000),
        costEn: longText(2000), costAr: longText(2000),
        supportEn: longText(2000), supportAr: longText(2000),
        noteEn: longText(2000), noteAr: longText(2000),
        strengthsEn: longText(2000), strengthsAr: longText(2000),
        highlight: z.boolean(),
      }),
    )
    .max(200),
  systemsReport: z.object({
    titleEn: text(300),
    titleAr: text(300),
    summaryEn: longText(3000),
    summaryAr: longText(3000),
    bodyAr: longText(200_000),
    date: text(20),
  }),
  openLibrary: z
    .array(
      z.object({
        id,
        num: z.number().int().min(0).max(1000),
        groupEn: requiredText(200, "Group"),
        groupAr: text(200),
        title: requiredText(300, "Name"),
        summaryEn: longText(2000),
        summaryAr: longText(2000),
        link: requiredLink,
      }),
    )
    .max(300),
  cv: z
    .array(
      z.object({
        id,
        titleEn: requiredText(200, "English title"),
        titleAr: requiredText(200, "Arabic title"),
        bodyEn: longText(30_000),
        bodyAr: longText(30_000),
      }),
    )
    .max(50),
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
