import type { Metadata } from "next";
import { BooksEditor } from "@/components/admin/editors";
import { loadForEditing } from "@/components/admin/load";
import { PageHeader } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Books" };

export default async function BooksPage() {
  const { content, error } = await loadForEditing("Books");
  if (!content) return error;

  return (
    <>
      <PageHeader
        title="Books"
        description="Authored and translated books. Each book has a cover and, optionally, a PDF or an external link."
      />
      <BooksEditor initial={content.data.books} />
    </>
  );
}
