import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { loadForEditing } from "@/components/admin/load";
import { PairedEditor } from "@/components/admin/paired-editor";
import { textSections } from "@/components/admin/sections";
import { PageHeader } from "@/components/admin/shell";

type Params = Promise<{ section: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { section } = await params;
  return { title: textSections.find((s) => s.key === section)?.label ?? "Site text" };
}

export default async function SectionTextPage({ params }: { params: Params }) {
  const { section } = await params;
  const meta = textSections.find((s) => s.key === section);
  if (!meta) notFound();

  const { content, error } = await loadForEditing(meta.label);
  if (!content) return error;

  return (
    <>
      <Link
        href="/admin/content"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> All sections
      </Link>
      <PageHeader title={meta.label} description={meta.description} />
      <PairedEditor
        key={meta.key}
        section={meta.key}
        label={meta.label}
        initialEn={JSON.parse(JSON.stringify(content.en[meta.key]))}
        initialAr={JSON.parse(JSON.stringify(content.ar[meta.key]))}
      />
    </>
  );
}
