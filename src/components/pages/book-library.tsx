"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpenText, FileText } from "lucide-react";
import { BookCard } from "@/components/sections/books";
import { Button } from "@/components/ui/button";
import { EmptyResults, ResultsBar, SelectFilter } from "@/components/ui/explorer";
import { FilterChips, SearchBox } from "@/components/ui/filters";
import type { Dictionary } from "@/content/types";
import { isUpload } from "@/data/site";
import { href, type Locale } from "@/i18n/config";
import { bookTopic, hit, searchIndex } from "@/lib/discover";
import { arrowNudge, cn, easeOutExpo, flipRtl } from "@/lib/utils";
import type { Book, PublicationCategory } from "@/types";

type Shelf = "all" | "readable" | "ar" | "en";
type Sort = "newest" | "oldest" | "alpha";

interface BookLibraryProps {
  books: Book[];
  locale: Locale;
  t: Dictionary["books"];
  page: Dictionary["booksPage"];
  shelf: Dictionary["shelf"];
  discover: Dictionary["discover"];
  topics: Dictionary["publications"]["categories"];
  /** Show the search and filter toolbar (the /books page). */
  filters?: boolean;
}

/** Featured "read online" books, then the searchable, filterable shelf. */
export function BookLibrary({ books, locale, t, page, shelf, discover, topics, filters }: BookLibraryProps) {
  const isAr = locale === "ar";
  const [view, setView] = React.useState<Shelf>("all");
  const [topic, setTopic] = React.useState<"all" | PublicationCategory>("all");
  const [year, setYear] = React.useState("all");
  const [sort, setSort] = React.useState<Sort>("newest");
  const [query, setQuery] = React.useState("");
  const deferredQuery = React.useDeferredValue(query);

  // Search text and topic are computed once per book, not on every keystroke.
  const indexed = React.useMemo(
    () =>
      books.map((b) => ({
        book: b,
        topic: bookTopic(b),
        index: searchIndex(b.title, b.titleAr, b.summaryEn, b.summaryAr, b.authorsEn, b.authorsAr, b.publisher, b.publisherAr, b.isbn, b.year),
      })),
    [books],
  );
  const featured = books.filter((b) => b.ebook || b.pdf);
  const titleOf = React.useCallback((b: Book) => (isAr && b.titleAr ? b.titleAr : b.title), [isAr]);

  const shown = React.useMemo(() => {
    const list = indexed
      .filter(({ book: b }) => (view === "all" ? true : view === "readable" ? Boolean(b.ebook || b.pdf) : b.language === view))
      .filter((x) => topic === "all" || x.topic === topic)
      .filter(({ book: b }) => year === "all" || String(b.year) === year)
      .filter((x) => hit(x.index, deferredQuery))
      .map((x) => x.book);
    const byYear = (a: Book, b: Book, dir: 1 | -1) => {
      if (a.year === b.year) return titleOf(a).localeCompare(titleOf(b), locale);
      if (a.year === null) return 1;
      if (b.year === null) return -1;
      return (a.year - b.year) * dir;
    };
    return list.sort((a, b) =>
      sort === "alpha" ? titleOf(a).localeCompare(titleOf(b), locale) : byYear(a, b, sort === "newest" ? -1 : 1),
    );
  }, [indexed, view, topic, year, deferredQuery, sort, titleOf, locale]);

  const active = view !== "all" || topic !== "all" || year !== "all" || query.trim() !== "";
  const reset = () => {
    setView("all");
    setTopic("all");
    setYear("all");
    setQuery("");
  };

  const shelfOptions = (["all", "readable", "ar", "en"] as Shelf[])
    .map((id) => ({
      id,
      label: id === "readable" ? shelf.featured : shelf.filters[id],
      count: id === "all" ? books.length : id === "readable" ? featured.length : books.filter((b) => b.language === id).length,
    }))
    .filter((o) => o.count > 0);
  const topicOptions = [
    { id: "all" as const, label: discover.allTopics },
    ...(["retrieval", "libraries", "other"] as PublicationCategory[])
      .map((id) => ({ id, label: topics[id], count: indexed.filter((x) => x.topic === id).length }))
      .filter((o) => o.count > 0),
  ];
  const years = [...new Set(books.map((b) => b.year).filter((y): y is number => y !== null))].sort((a, b) => b - a);
  const yearOptions = [{ id: "all", label: discover.allYears }, ...years.map((y) => ({ id: String(y), label: String(y) }))];
  const sortOptions = (["newest", "oldest", "alpha"] as Sort[]).map((id) => ({ id, label: discover.sorts[id] }));

  return (
    <div className="grid min-w-0 gap-14 [&>*]:min-w-0">
      {filters && (
        <div role="search" aria-label={discover.filtersLabel} className="glass grid gap-4 rounded-3xl p-4 sm:p-5">
          <SearchBox value={query} onChange={setQuery} label={discover.bookSearchLabel} placeholder={discover.bookSearchPlaceholder} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <SelectFilter label={discover.topic} value={topic} onChange={setTopic} options={topicOptions} />
            <SelectFilter label={discover.year} value={year} onChange={setYear} options={yearOptions} />
            <SelectFilter label={discover.sort} value={sort} onChange={setSort} options={sortOptions} className="col-span-2 sm:col-span-1" />
          </div>
          {shelfOptions.length > 2 && (
            <FilterChips options={shelfOptions} value={view} onChange={setView} label={shelf.filterLabel} layoutId="book-filter" />
          )}
        </div>
      )}

      {featured.length > 0 && !active && (
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
        {filters && (
          <div className="mb-8">
            <ResultsBar
              template={discover.showing}
              shown={shown.length}
              total={books.length}
              noun={discover.nouns.books}
              active={active}
              onReset={reset}
              resetLabel={discover.reset}
            />
          </div>
        )}
        {shown.length === 0 && (
          <EmptyResults title={discover.emptyBooks} hint={discover.emptyHint} resetLabel={discover.reset} onReset={reset} className="glass rounded-3xl" />
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
