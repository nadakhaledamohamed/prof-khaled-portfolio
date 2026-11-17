import type { Metadata } from "next";
import { GalleryEditor } from "@/components/admin/editors";
import { loadForEditing } from "@/components/admin/load";
import { PageHeader } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const { content, error } = await loadForEditing("Gallery");
  if (!content) return error;

  return (
    <>
      <PageHeader
        title="Gallery"
        description="Images open in a full-screen viewer; PDFs open in a new tab. Titles and captions are shown in the visitor's language."
      />
      <GalleryEditor initial={content.data.gallery} />
    </>
  );
}
