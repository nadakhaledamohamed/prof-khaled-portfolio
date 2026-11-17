import { del } from "@vercel/blob";
import { db } from "./db";

/**
 * Uploads go straight from the browser to Vercel Blob (see /api/admin/upload), which avoids
 * the 4.5 MB request limit of serverless functions. This module keeps a record of each file
 * for the media library.
 */

const MB = 1024 * 1024;

export const UPLOAD_RULES = {
  image: {
    types: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
    max: 10 * MB,
  },
  pdf: { types: ["application/pdf"], max: 25 * MB },
} as const;

export type UploadKind = "image" | "pdf" | "any";

export function rulesFor(kind: UploadKind) {
  if (kind === "image") return { types: [...UPLOAD_RULES.image.types], max: UPLOAD_RULES.image.max };
  if (kind === "pdf") return { types: [...UPLOAD_RULES.pdf.types], max: UPLOAD_RULES.pdf.max };
  return { types: [...UPLOAD_RULES.image.types, ...UPLOAD_RULES.pdf.types], max: UPLOAD_RULES.pdf.max };
}

/** Only files in this project's Blob store are accepted as uploads. */
export function isBlobUrl(url: string) {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export async function registerMedia(file: {
  url: string;
  pathname: string;
  name: string;
  type: string;
  size: number;
}) {
  const q = await db();
  await q`
    INSERT INTO web_media (url, pathname, original_name, content_type, size)
    VALUES (${file.url}, ${file.pathname}, ${file.name.slice(0, 255)}, ${file.type}, ${file.size})
    ON CONFLICT (url) DO NOTHING
  `;
}

export interface MediaRow {
  Id: number;
  Url: string;
  OriginalName: string;
  ContentType: string;
  Size: number | string;
  CreatedAt: Date | string;
}

export async function listMedia(): Promise<MediaRow[]> {
  const q = await db();
  return (await q`
    SELECT id AS "Id", url AS "Url", original_name AS "OriginalName", content_type AS "ContentType",
           size AS "Size", created_at AS "CreatedAt"
    FROM web_media ORDER BY created_at DESC
  `) as MediaRow[];
}

export async function deleteMedia(id: number) {
  const q = await db();
  const rows = (await q`DELETE FROM web_media WHERE id = ${id} RETURNING url`) as { url: string }[];
  const url = rows[0]?.url;
  if (url && isBlobUrl(url)) await del(url).catch(() => undefined);
  return Boolean(url);
}
