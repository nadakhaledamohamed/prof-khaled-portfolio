"use client";

import * as React from "react";
import { ExternalLink, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface TocEntry {
  title: string;
  page: number;
  level: number;
}

/** Parses "Title | page" lines; leading dashes ("-", "--") set the nesting level. */
export function parseToc(toc: string): TocEntry[] {
  return toc
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const level = (line.match(/^-+/)?.[0].length ?? 0) as number;
      const body = line.replace(/^-+\s*/, "");
      const [title, page] = body.split("|").map((part) => part.trim());
      return { title, page: Number.parseInt(page ?? "", 10) || 1, level };
    });
}

/**
 * Full-book PDF reader: the browser's own PDF viewer in a frame, plus a table of contents
 * that jumps to the right page. `offset` converts printed page numbers to PDF pages.
 */
export function PdfReader({
  pdf,
  toc,
  offset,
  title,
  labels,
  tocLang,
}: {
  pdf: string;
  toc: string;
  offset: number;
  title: string;
  /** Language of the table of contents (Arabic books list it right-to-left). */
  tocLang?: "ar" | "en";
  labels: { contents: string; openPdf: string; page: string };
}) {
  const entries = React.useMemo(() => parseToc(toc), [toc]);
  const [page, setPage] = React.useState(1);
  const [showToc, setShowToc] = React.useState(false);
  const src = `${pdf}#page=${Math.max(1, page + offset)}&view=FitH`;

  return (
    <div className="glass overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={() => setShowToc((v) => !v)}
          aria-expanded={showToc}
          className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-medium lg:hidden"
        >
          <List className="size-4" aria-hidden /> {labels.contents}
        </button>
        <p className="hidden truncate text-sm font-medium lg:block">{title}</p>
        <a
          href={pdf}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary"
        >
          {labels.openPdf} <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </div>
      <div className="grid lg:grid-cols-[20rem_1fr]">
        <nav
          aria-label={labels.contents}
          lang={tocLang}
          dir={tocLang === "ar" ? "rtl" : undefined}
          className={cn(
            "max-h-[75vh] overflow-y-auto border-border p-3 lg:block lg:border-e",
            showToc ? "block border-b" : "hidden",
          )}
        >
          <ol className="grid gap-0.5">
            {entries.map((entry, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    setPage(entry.page);
                    setShowToc(false);
                  }}
                  className={cn(
                    "flex w-full items-baseline justify-between gap-3 rounded-xl px-3 py-2 text-start text-sm transition-colors hover:bg-foreground/[0.05]",
                    entry.level === 0 && "font-semibold",
                    entry.level === 1 && "ps-6 text-muted-foreground",
                    entry.level >= 2 && "ps-9 text-xs text-muted-foreground",
                    page === entry.page && "bg-primary/10 text-primary",
                  )}
                >
                  <span>{entry.title}</span>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums opacity-70">
                    {labels.page} {entry.page}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <iframe key={src} src={src} title={title} className="h-[75vh] w-full bg-white" loading="lazy" />
      </div>
    </div>
  );
}
