import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { db, sql } from "./db";

/**
 * Uploaded files live on the server's disk (MEDIA_DIR, default ./storage/media) and are
 * served by /media/[name]. Next.js only serves public/ files that existed at build time,
 * so uploads cannot go there.
 */
export const MEDIA_DIR = process.env.MEDIA_DIR
  ? path.resolve(process.env.MEDIA_DIR)
  : path.join(process.cwd(), "storage", "media");

const MB = 1024 * 1024;

const KINDS = {
  jpg: { type: "image/jpeg", max: 10 * MB },
  png: { type: "image/png", max: 10 * MB },
  gif: { type: "image/gif", max: 10 * MB },
  webp: { type: "image/webp", max: 10 * MB },
  avif: { type: "image/avif", max: 10 * MB },
  pdf: { type: "application/pdf", max: 25 * MB },
} as const;

export type MediaExt = keyof typeof KINDS;
export const MEDIA_NAME = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(jpg|png|gif|webp|avif|pdf)$/;

/** Detects the real file type from its first bytes (never trusts the name or browser-sent type). */
function sniff(bytes: Buffer): MediaExt | null {
  const ascii = (start: number, end: number) => bytes.subarray(start, end).toString("latin1");
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (ascii(0, 4) === "GIF8") return "gif";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (ascii(4, 12) === "ftypavif") return "avif";
  if (ascii(0, 5) === "%PDF-") return "pdf";
  return null;
}

export type UploadKind = "image" | "pdf" | "any";

export async function saveUpload(file: File, accept: UploadKind) {
  if (!file || file.size === 0) throw new UploadError("Choose a file to upload.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = sniff(bytes);
  if (!ext) throw new UploadError("Unsupported file. Use JPG, PNG, WebP, GIF, AVIF or PDF.");
  if (accept === "image" && ext === "pdf") throw new UploadError("Please choose an image file.");
  if (accept === "pdf" && ext !== "pdf") throw new UploadError("Please choose a PDF file.");
  const kind = KINDS[ext];
  if (bytes.length > kind.max) {
    throw new UploadError(`File is too large (max ${Math.round(kind.max / MB)} MB).`);
  }

  const storedName = `${randomUUID()}.${ext}`;
  await mkdir(MEDIA_DIR, { recursive: true });
  await writeFile(path.join(MEDIA_DIR, storedName), bytes);

  const originalName = (file.name || storedName).slice(0, 255);
  const pool = await db();
  await pool
    .request()
    .input("stored", sql.NVarChar(100), storedName)
    .input("original", sql.NVarChar(260), originalName)
    .input("type", sql.NVarChar(100), kind.type)
    .input("size", sql.BigInt, bytes.length)
    .query(
      "INSERT INTO dbo.WebMedia (StoredName, OriginalName, ContentType, Size) VALUES (@stored, @original, @type, @size)",
    );

  return { url: `/media/${storedName}`, name: originalName, type: kind.type };
}

export class UploadError extends Error {}

export function contentTypeFor(name: string) {
  const ext = name.split(".").pop() as MediaExt;
  return KINDS[ext]?.type ?? "application/octet-stream";
}

export async function readMedia(name: string) {
  if (!MEDIA_NAME.test(name)) return null;
  try {
    return await readFile(path.join(MEDIA_DIR, name));
  } catch {
    return null;
  }
}

export interface MediaRow {
  Id: number;
  StoredName: string;
  OriginalName: string;
  ContentType: string;
  Size: number;
  CreatedAt: Date;
}

export async function listMedia() {
  const pool = await db();
  const result = await pool
    .request()
    .query<MediaRow>("SELECT Id, StoredName, OriginalName, ContentType, Size, CreatedAt FROM dbo.WebMedia ORDER BY CreatedAt DESC");
  return result.recordset;
}

export async function deleteMedia(id: number) {
  const pool = await db();
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query<{ StoredName: string }>("DELETE FROM dbo.WebMedia OUTPUT DELETED.StoredName WHERE Id = @id");
  const name = result.recordset[0]?.StoredName;
  if (name && MEDIA_NAME.test(name)) {
    await unlink(path.join(MEDIA_DIR, name)).catch(() => undefined);
  }
  return Boolean(name);
}
