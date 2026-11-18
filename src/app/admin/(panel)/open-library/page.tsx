import type { Metadata } from "next";
import { OpenLibraryEditor } from "@/components/admin/editors";
import { loadForEditing } from "@/components/admin/load";
import { PageHeader } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Open repositories" };

export default async function Page() {
  const { content, error } = await loadForEditing("Open repositories");
  if (!content) return error;

  return (
    <>
      <PageHeader title="Open repositories" description="Guide to open platforms for journals, books, repositories, research data and educational resources." />
      <OpenLibraryEditor initial={content.data.openLibrary} />
    </>
  );
}
