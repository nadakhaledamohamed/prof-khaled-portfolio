import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { textSections } from "@/components/admin/sections";
import { PageHeader } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Site text" };

export default function ContentIndexPage() {
  return (
    <>
      <PageHeader
        title="Site text"
        description="Every word on the website, in English and Arabic side by side. Pick a section to edit."
      />
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {textSections.map((section) => (
          <li key={section.key}>
            <Link
              href={`/admin/content/${section.key}`}
              className="glass group flex h-full flex-col gap-1.5 rounded-2xl p-5 transition-[translate,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/40"
            >
              <span className="flex items-center justify-between font-semibold">
                {section.label}
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">{section.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
