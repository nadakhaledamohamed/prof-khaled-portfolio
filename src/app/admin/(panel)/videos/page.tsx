import type { Metadata } from "next";
import { VideosEditor } from "@/components/admin/editors";
import { loadForEditing } from "@/components/admin/load";
import { PageHeader } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Videos" };

export default async function Page() {
  const { content, error } = await loadForEditing("Videos");
  if (!content) return error;

  return (
    <>
      <PageHeader title="Videos" description="YouTube videos play on the site; other links (Facebook, TV channels) open in a new tab." />
      <VideosEditor initial={content.data.videos} />
    </>
  );
}
