import type { Metadata } from "next";
import { SystemsEditor } from "@/components/admin/editors";
import { loadForEditing } from "@/components/admin/load";
import { ReportEditor } from "@/components/admin/report-editor";
import { PageHeader } from "@/components/admin/shell";

export const metadata: Metadata = { title: "System reviews" };

export default async function Page() {
  const { content, error } = await loadForEditing("System reviews");
  if (!content) return error;

  return (
    <>
      <PageHeader title="System reviews" description="Comparative evaluation of library systems and knowledge platforms on five indicators." />
      <SystemsEditor initial={content.data.systems} />
      <ReportEditor initial={content.data.systemsReport} />
    </>
  );
}
