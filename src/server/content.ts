import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { defaultContent } from "@/content";
import type { SiteContent } from "@/content/types";
import { db } from "./db";

const CONTENT_ID = "site";
export const CONTENT_TAG = "site-content";

/**
 * Overlays stored content on the bundled defaults, so fields added to the code later
 * still have a value. Objects merge key by key; arrays and primitives come from storage.
 */
function mergeDefaults<T>(base: T, stored: unknown): T {
  if (Array.isArray(base)) return (Array.isArray(stored) ? stored : base) as T;
  if (base !== null && typeof base === "object") {
    if (stored === null || typeof stored !== "object" || Array.isArray(stored)) return base;
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const key of Object.keys(out)) {
      out[key] = mergeDefaults(out[key], (stored as Record<string, unknown>)[key]);
    }
    // Keep optional keys that exist only in storage (e.g. a note added in one language).
    for (const [key, value] of Object.entries(stored as Record<string, unknown>)) {
      if (!(key in out)) out[key] = value;
    }
    return out as T;
  }
  return (typeof stored === typeof base && stored !== undefined ? stored : base) as T;
}

interface ContentRow {
  json: unknown;
  updated_at: string | Date;
  updated_by: string | null;
}

/** Reads the stored document, seeding it from the defaults on first run. Throws if the database fails. */
export async function readSiteContent(): Promise<{
  content: SiteContent;
  updatedAt: Date | null;
  updatedBy: string | null;
}> {
  const q = await db();
  const rows = (await q`
    SELECT json, updated_at, updated_by FROM web_content WHERE id = ${CONTENT_ID}
  `) as ContentRow[];

  const row = rows[0];
  if (!row) {
    await q`
      INSERT INTO web_content (id, json, updated_by)
      VALUES (${CONTENT_ID}, ${JSON.stringify(defaultContent)}::jsonb, 'seed')
      ON CONFLICT (id) DO NOTHING
    `;
    return { content: defaultContent, updatedAt: null, updatedBy: null };
  }

  const stored = typeof row.json === "string" ? JSON.parse(row.json) : row.json;
  return {
    content: mergeDefaults(defaultContent, stored),
    updatedAt: new Date(row.updated_at),
    updatedBy: row.updated_by,
  };
}

const loggedFailures = new Set<string>();

const cachedContent = unstable_cache(
  async (): Promise<SiteContent> => (await readSiteContent()).content,
  ["site-content-v1"],
  { tags: [CONTENT_TAG], revalidate: 300 },
);

/**
 * Content for public pages: cached and refreshed on save. Never throws — if the database
 * is unreachable the bundled content is served, and that fallback is not cached, so the
 * next request tries the database again.
 */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    return await cachedContent();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Log each distinct failure once per process, not once per page.
    if (!loggedFailures.has(message)) {
      loggedFailures.add(message);
      if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
        // Expected before a database is connected: the bundled content is the site's content.
        console.info("[content] No database configured (DATABASE_URL); serving the bundled content.");
      } else {
        console.warn("[content] Database unavailable, serving the bundled content:", message);
      }
    }
    return defaultContent;
  }
}

export async function writeSiteContent(content: SiteContent, updatedBy: string) {
  const q = await db();
  await q`
    INSERT INTO web_content (id, json, updated_at, updated_by)
    VALUES (${CONTENT_ID}, ${JSON.stringify(content)}::jsonb, now(), ${updatedBy})
    ON CONFLICT (id) DO UPDATE
      SET json = EXCLUDED.json, updated_at = now(), updated_by = EXCLUDED.updated_by
  `;

  // Refresh the public pages right away.
  revalidateTag(CONTENT_TAG);
  revalidatePath("/[locale]", "page");
}
