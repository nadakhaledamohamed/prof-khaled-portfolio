"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, List, LoaderCircle, Search, X } from "lucide-react";
import { matches } from "@/components/ui/filters";
import { cn, flipRtl } from "@/lib/utils";

interface EbookSection {
  id: string;
  num?: string;
  title: string;
  page: number;
  lvl?: number;
}
interface EbookChapter extends EbookSection {
  label: string;
  secs: EbookSection[];
}
interface Ebook {
  title: string;
  author: string;
  publisher: string;
  year: string;
  isbn: string;
  chapters: EbookChapter[];
  content: Record<string, string>;
}

interface Labels {
  contents: string;
  page: string;
  prev: string;
  next: string;
  search: string;
  noResults: string;
  loading: string;
}

/**
 * Full-text e-book reader. The book (chapters and HTML content, prepared at import time with
 * figure paths resolved and scripts stripped) is fetched once; reading position is kept in
 * the URL hash so chapters can be linked and the back button works.
 */
export function EbookReader({ src, labels }: { src: string; labels: Labels }) {
  const [book, setBook] = React.useState<Ebook | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [current, setCurrent] = React.useState<string>("");
  const [showToc, setShowToc] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const articleRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: Ebook) => {
        if (cancelled) return;
        setBook(data);
        const fromHash = window.location.hash.slice(1);
        const first = data.chapters.find((c) => data.content[c.id]?.trim())?.id ?? data.chapters[0]?.id ?? "";
        setCurrent(fromHash && data.content[fromHash] !== undefined ? fromHash : first);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [src]);

  // Flat reading order: each chapter followed by its sections.
  const order = React.useMemo(() => {
    if (!book) return [] as EbookSection[];
    return book.chapters.flatMap((c) => [c, ...c.secs]);
  }, [book]);

  const index = order.findIndex((s) => s.id === current);
  const go = React.useCallback(
    (id: string) => {
      setCurrent(id);
      setShowToc(false);
      history.replaceState(null, "", `#${id}`);
      articleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [],
  );

  React.useEffect(() => {
    const onHash = () => {
      const id = window.location.hash.slice(1);
      if (id && book?.content[id] !== undefined) setCurrent(id);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [book]);

  if (failed) return null;
  if (!book) {
    return (
      <p className="flex items-center justify-center gap-2 py-24 text-muted-foreground" role="status">
        <LoaderCircle className="size-5 animate-spin" aria-hidden /> {labels.loading}
      </p>
    );
  }

  // Search matches section titles and their text.
  const plain = (html: string) => html.replace(/<[^>]+>/g, " ");
  const hits = query.trim()
    ? order.filter((s) => matches(query, s.title, plain(book.content[s.id] ?? "")))
    : null;

  const section = order[index];
  const html = book.content[current] ?? "";
  const prev = index > 0 ? order[index - 1] : null;
  const next = index >= 0 && index < order.length - 1 ? order[index + 1] : null;

  const toc = (
    <nav aria-label={labels.contents} className="grid gap-3">
      <label className="relative block">
        <span className="sr-only">{labels.search}</span>
        <Search aria-hidden className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.search}
          className="h-10 w-full rounded-full border border-border bg-background/60 pe-3 ps-9 text-sm focus:border-primary focus:outline-none"
        />
      </label>
      {hits ? (
        hits.length ? (
          <ol className="grid gap-0.5">
            {hits.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => go(s.id)} className="w-full rounded-xl px-3 py-2 text-start text-sm hover:bg-foreground/[0.05]">
                  {s.num ? <span className="me-1 font-mono text-xs text-muted-foreground">{s.num}</span> : null}
                  {s.title}
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="px-3 text-sm text-muted-foreground">{labels.noResults}</p>
        )
      ) : (
        <ol className="grid gap-1">
          {book.chapters.map((chapter) => {
            const open = chapter.id === current || chapter.secs.some((s) => s.id === current);
            return (
              <li key={chapter.id}>
                <button
                  type="button"
                  onClick={() => go(chapter.id)}
                  className={cn(
                    "w-full rounded-xl px-3 py-2 text-start text-sm font-semibold transition-colors hover:bg-foreground/[0.05]",
                    chapter.id === current && "bg-primary/10 text-primary",
                  )}
                >
                  {chapter.label && <span className="block text-xs font-medium text-muted-foreground">{chapter.label}</span>}
                  {chapter.title}
                </button>
                {open && chapter.secs.length > 0 && (
                  <ol className="mt-1 grid gap-0.5 border-s border-border ms-4">
                    {chapter.secs.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => go(s.id)}
                          className={cn(
                            "w-full rounded-lg py-1.5 pe-2 ps-3 text-start text-xs text-muted-foreground transition-colors hover:text-foreground",
                            (s.lvl ?? 2) > 2 && "ps-6",
                            s.id === current && "font-semibold text-primary",
                          )}
                        >
                          {s.num ? <span className="me-1 font-mono">{s.num}</span> : null}
                          {s.title}
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );

  return (
    <div lang="ar" dir="rtl" className="grid gap-6 lg:grid-cols-[19rem_1fr]">
      <aside className="glass hidden max-h-[calc(100vh-8rem)] overflow-y-auto rounded-3xl p-4 lg:sticky lg:top-28 lg:block">{toc}</aside>

      <div ref={articleRef} className="scroll-mt-28">
        <button
          type="button"
          onClick={() => setShowToc(true)}
          className="glass mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium lg:hidden"
        >
          <List className="size-4" aria-hidden /> {labels.contents}
        </button>

        <article className="glass rounded-3xl p-6 sm:p-10">
          {section && (
            <header className="mb-8 border-b border-border pb-6">
              <p className="font-mono text-xs text-muted-foreground">
                {labels.page} {section.page}
              </p>
              <h2 className="mt-2 font-display text-3xl font-medium leading-snug">
                {section.num ? `${section.num} ` : ""}
                {section.title}
              </h2>
            </header>
          )}
          {/* Book HTML was sanitised at import (no scripts, event handlers or embeds). */}
          <div className="ebook" dangerouslySetInnerHTML={{ __html: html || "" }} />
        </article>

        <div className="mt-6 flex items-center justify-between gap-3">
          {prev ? (
            <button type="button" onClick={() => go(prev.id)} className="glass inline-flex max-w-[48%] items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium">
              <ChevronRight className={cn("size-4 shrink-0", flipRtl)} aria-hidden />
              <span className="truncate">{prev.title}</span>
              <span className="sr-only">{labels.prev}</span>
            </button>
          ) : (
            <span />
          )}
          {next && (
            <button type="button" onClick={() => go(next.id)} className="glass inline-flex max-w-[48%] items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium">
              <span className="sr-only">{labels.next}</span>
              <span className="truncate">{next.title}</span>
              <ChevronLeft className={cn("size-4 shrink-0", flipRtl)} aria-hidden />
            </button>
          )}
        </div>
      </div>

      {showToc && (
        <div role="dialog" aria-modal="true" aria-label={labels.contents} className="fixed inset-0 z-[80] bg-background/95 p-5 pt-20 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setShowToc(false)}
            aria-label="Close"
            className="absolute end-5 top-5 grid size-10 place-items-center rounded-full border border-border"
          >
            <X className="size-5" />
          </button>
          <div className="h-full overflow-y-auto">{toc}</div>
        </div>
      )}
    </div>
  );
}
