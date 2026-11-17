import type { Metadata } from "next";
import { PublicationsEditor } from "@/components/admin/editors";
import { loadForEditing } from "@/components/admin/load";
import { PageHeader } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Publications" };

export default async function PublicationsPage() {
  const { content, error } = await loadForEditing("Publications");
  if (!content) return error;

  return (
    <>
      <PageHeader
        title="Publications"
        description="Peer-reviewed articles, conference papers and dissertations. The citation dashboard is calculated from this list."
      />
      <PublicationsEditor initial={content.data.publications} />
    </>
  );
}
