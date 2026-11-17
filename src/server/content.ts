import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { defaultContent } from "@/content";
import type { SiteContent } from "@/content/types";
import { db, sql } from "./db";

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

/** Reads the stored document, seeding it from the defaults on first run. Throws if the database fails. */
export async function readSiteContent(): Promise<{ content: SiteContent; updatedAt: Date | null; updatedBy: string | null }> {
  const pool = await db();
  const result = await pool
    .request()
    .input("id", sql.NVarChar(32), CONTENT_ID)
    .query<{ Json: string; UpdatedAt: Date; UpdatedBy: string | null }>(
      "SELECT Json, UpdatedAt, UpdatedBy FROM dbo.WebContent WHERE Id = @id",
    );

  const row = result.recordset[0];
  if (!row) {
    // First run: store the bundled content. The lock hints make concurrent first requests
    // wait for each other instead of colliding on the primary key.
    await pool
      .request()
      .input("id", sql.NVarChar(32), CONTENT_ID)
      .input("json", sql.NVarChar(sql.MAX), JSON.stringify(defaultContent))
      .query(`
        INSERT INTO dbo.WebContent (Id, Json, UpdatedBy)
        SELECT @id, @json, N'seed'
        WHERE NOT EXISTS (SELECT 1 FROM dbo.WebContent WITH (UPDLOCK, HOLDLOCK) WHERE Id = @id);
      `)
      .catch((error: { number?: number }) => {
        if (error?.number !== 2627) throw error; // 2627 = another request seeded it first
      });
    return { content: defaultContent, updatedAt: null, updatedBy: null };
  }

  return {
    content: mergeDefaults(defaultContent, JSON.parse(row.Json)),
    updatedAt: row.UpdatedAt,
    updatedBy: row.UpdatedBy,
  };
}

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
    console.error(
      "[content] database unavailable, serving bundled content:",
      error instanceof Error ? error.message : error,
    );
    return defaultContent;
  }
}

export async function writeSiteContent(content: SiteContent, updatedBy: string) {
  const pool = await db();
  await pool
    .request()
    .input("id", sql.NVarChar(32), CONTENT_ID)
    .input("json", sql.NVarChar(sql.MAX), JSON.stringify(content))
    .input("by", sql.NVarChar(100), updatedBy)
    .query(`
      UPDATE dbo.WebContent SET Json = @json, UpdatedAt = SYSUTCDATETIME(), UpdatedBy = @by WHERE Id = @id;
      IF @@ROWCOUNT = 0 INSERT INTO dbo.WebContent (Id, Json, UpdatedBy) VALUES (@id, @json, @by);
    `);

  // Refresh the public pages right away.
  revalidateTag(CONTENT_TAG);
  revalidatePath("/[locale]", "page");
}
