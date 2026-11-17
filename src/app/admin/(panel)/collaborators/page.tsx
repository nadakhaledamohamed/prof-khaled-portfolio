import type { Metadata } from "next";
import { CollaboratorsEditor } from "@/components/admin/editors";
import { loadForEditing } from "@/components/admin/load";
import { PageHeader } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Collaborators" };

export default async function CollaboratorsPage() {
  const { content, error } = await loadForEditing("Collaborators");
  if (!content) return error;

  return (
    <>
      <PageHeader title="Collaborators" description="Co-authors shown in the Network section." />
      <CollaboratorsEditor initial={content.data.collaborators} />
    </>
  );
}
