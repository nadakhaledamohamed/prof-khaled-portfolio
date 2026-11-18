"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpenText, FileText } from "lucide-react";
import { BookCard } from "@/components/sections/books";
import { Button } from "@/components/ui/button";
import { FilterChips } from "@/components/ui/filters";
import type { Dictionary } from "@/content/types";
import { isUpload } from "@/data/site";
import { href, type Locale } from "@/i18n/config";
import { arrowNudge, cn, easeOutExpo, flipRtl } from "@/lib/utils";
import type { Book } from "@/types";

type Filter = "all" | "ar" | "en" | "readable";

interface BookLibraryProps {
  books: Book[];
  locale: Locale;
  t: Dictionary["books"];
  page: Dictionary["booksPage"];
  shelf: Dictionary["shelf"];
  /** Show the filter chips (the /books page). */
  filters?: boolean;
}

/** Featured "read online" books, then the full shelf. */
export function BookLibrary({ books, locale, t, page, shelf, filters }: BookLibraryProps) {
  const isAr = locale === "ar";
  const [filter, setFilter] = React.useState<Filter>("all");
  const featured = books.filter((b) => b.ebook || b.pdf);
  const shown = books.filter((b) =>
    filter === "all" ? true : filter === "readable" ? Boolean(b.ebook || b.pdf) : b.language === filter,
  );

  const options = (["all", "ar", "en", "readable"] as Filter[])
    .map((id) => ({
      id,
      label: shelf.filters[id],
      count: id === "all" ? books.length : id === "readable" ? featured.length : books.filter((b) => b.language === id).length,
    }))
    .filter((o) => o.count > 0);

  return (
    <div className="grid min-w-0 gap-14 [&>*]:min-w-0">
      {featured.length > 0 && (
        <div>
          <p className="mb-5 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <span aria-hidden className="bg-brand h-px w-8" />
            {shelf.featured}
          </p>
          <ul className="grid gap-5 lg:grid-cols-2 [&>li]:min-w-0">
            {featured.map((book, i) => {
              const title = isAr && book.titleAr ? book.titleAr : book.title;
              const summary = isAr ? book.summaryAr || book.summaryEn : book.summaryEn || book.summaryAr;
              const authors = isAr ? book.authorsAr || book.authorsEn : book.authorsEn || book.authorsAr;
              const read = book.ebook ? href(locale, `/books/${book.id}/read`) : href(locale, `/books/${book.id}#reader`);
              return (
                <motion.li
                  key={book.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: easeOutExpo }}
                >
                  <article className="glass group relative flex h-full gap-5 overflow-hidden rounded-3xl p-5 sm:gap-7 sm:p-7">
                    <div aria-hidden className="bg-brand absolute -end-16 -top-16 size-48 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-25" />
                    <Link href={read} className="relative w-28 shrink-0 [perspective:900px] sm:w-36" tabIndex={-1} aria-hidden>
                      <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-[0_20px_40px_-15px_rgb(0_0_0/0.55)] transition-transform duration-700 ease-out group-hover:[transform:rotateY(-12deg)_translateY(-4px)]">
                        {book.cover && (
                          <Image src={book.cover} alt="" fill sizes="144px" unoptimized={isUpload(book.cover)} className="object-cover" />
                        )}
                        <span aria-hidden className={cn("absolute inset-y-0 w-2.5 from-black/30 to-transparent", book.language === "ar" ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r")} />
                      </div>
                    </Link>
                    <div className="relative flex min-w-0 flex-col">
                      <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                        {book.ebook ? <BookOpenText className="size-3.5" aria-hidden /> : <FileText className="size-3.5" aria-hidden />}
                        {book.ebook ? page.ebookBadge : page.pdfBadge}
                      </span>
                      <h3 lang={isAr && !book.titleAr ? "en" : undefined} className="font-display text-xl font-medium leading-snug text-balance sm:text-2xl rtl:leading-relaxed">
                        {title}
                      </h3>
                      <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{authors}</p>
                      {summary && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{summary}</p>}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {(isAr ? book.publisherAr : book.publisher)}
                        {book.year ? ` · ${book.year}` : ""}
                      </p>
                      <div className="mt-auto flex flex-wrap gap-2 pt-5">
                        <Button asChild size="sm" variant="brand">
                          <Link href={read}>
                            {page.readOnline} <ArrowRight className={cn(arrowNudge, flipRtl)} />
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link href={href(locale, `/books/${book.id}`)}>{shelf.details}</Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                </motion.li>
              );
            })}
          </ul>
        </div>
      )}

      <div>
        {filters && options.length > 2 && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <FilterChips options={options} value={filter} onChange={setFilter} label={shelf.filterLabel} layoutId="book-filter" />
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground" aria-live="polite">
              <span className="tabular-nums">{shown.length}</span> / <span className="tabular-nums">{books.length}</span>
            </p>
          </div>
        )}
        {/* The shelf: each book stands on a plank; rows of planks read as a bookcase. */}
        <ul className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((book, i) => (
              <motion.li
                key={book.id}
                layout
                className="relative after:pointer-events-none after:absolute after:-inset-x-2.5 after:-bottom-5 after:h-1.5 after:rounded-full after:bg-gradient-to-b after:from-foreground/10 after:to-transparent after:content-['']"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: Math.min(i, 8) * 0.04, ease: easeOutExpo }}
              >
                <BookCard book={book} t={t} page={page} locale={locale} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}
