import type { Metadata } from "next";
import { CvEditor } from "@/components/admin/editors";
import { loadForEditing } from "@/components/admin/load";
import { PageHeader } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Curriculum vitae" };

export default async function Page() {
  const { content, error } = await loadForEditing("Curriculum vitae");
  if (!content) return error;

  return (
    <>
      <PageHeader title="Curriculum vitae" description="The sections of the CV page, in English and Arabic." />
      <CvEditor initial={content.data.cv} />
    </>
  );
}
