import { DbError } from "@/components/admin/db-error";
import { PageHeader } from "@/components/admin/shell";
import type { SiteContent } from "@/content/types";
import { readSiteContent } from "@/server/content";

/**
 * Loads fresh (uncached) content for an admin page. Returns either the content or
 * a ready-to-render error screen, so editors never open on stale fallback data.
 */
export async function loadForEditing(
  title: string,
): Promise<{ content: SiteContent; error: null } | { content: null; error: React.ReactNode }> {
  try {
    const { content } = await readSiteContent();
    return { content, error: null };
  } catch (error) {
    return {
      content: null,
      error: (
        <>
          <PageHeader title={title} />
          <DbError error={error} />
        </>
      ),
    };
  }
}
