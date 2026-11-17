import type { Metadata } from "next";
import { DbError } from "@/components/admin/db-error";
import { MediaGrid, type MediaView } from "@/components/admin/media-grid";
import { PageHeader } from "@/components/admin/shell";
import { readSiteContent } from "@/server/content";
import { listMedia } from "@/server/media";

export const metadata: Metadata = { title: "Media library" };

export default async function MediaPage() {
  let items: MediaView[];
  try {
    const [rows, { content }] = await Promise.all([listMedia(), readSiteContent()]);
    // A file is "in use" when its link appears anywhere in the site content.
    const serialized = JSON.stringify(content);
    items = rows.map((row) => {
      const url = `/media/${row.StoredName}`;
      return {
        id: row.Id,
        url,
        name: row.OriginalName,
        type: row.ContentType,
        size: Number(row.Size),
        createdAt: new Date(row.CreatedAt).toISOString(),
        inUse: serialized.includes(url),
      };
    });
  } catch (error) {
    return (
      <>
        <PageHeader title="Media library" />
        <DbError error={error} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Media library"
        description="Every uploaded image and PDF. Files still used on the site can't be deleted."
      />
      <MediaGrid items={items} />
    </>
  );
}
