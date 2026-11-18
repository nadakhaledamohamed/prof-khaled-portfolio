import type { Metadata } from "next";
import { TalksEditor } from "@/components/admin/editors";
import { loadForEditing } from "@/components/admin/load";
import { PageHeader } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Courses & talks" };

export default async function Page() {
  const { content, error } = await loadForEditing("Courses & talks");
  if (!content) return error;

  return (
    <>
      <PageHeader title="Courses & talks" description="Courses and public talks, each with its lectures or slide decks (PDF)." />
      <TalksEditor initial={content.data.talks} />
    </>
  );
}
