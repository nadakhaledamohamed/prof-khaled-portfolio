import type { Metadata } from "next";
import { ArticlesEditor } from "@/components/admin/editors";
import { loadForEditing } from "@/components/admin/load";
import { PageHeader } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Articles" };

export default async function Page() {
  const { content, error } = await loadForEditing("Articles");
  if (!content) return error;

  return (
    <>
      <PageHeader title="Articles" description="Essays and opinion pieces. Each article gets its own page with the full text." />
      <ArticlesEditor initial={content.data.articles} />
    </>
  );
}
