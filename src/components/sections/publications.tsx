"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, FileText, Info, LayoutGrid, List } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyResults, ResultsBar, SelectFilter } from "@/components/ui/explorer";
import { FilterChips, SearchBox } from "@/components/ui/filters";
import type { Dictionary } from "@/content/types";
import { categories } from "@/data/site";
import { href, type Locale } from "@/i18n/config";
import { hit, publicationType, searchIndex, topicFromText, type PubType } from "@/lib/discover";
import { arrowNudge, cn, easeOutExpo, flipRtl } from "@/lib/utils";
import type { Article, Publication, PublicationCategory } from "@/types";

type Topic = "all" | PublicationCategory;
type TypeFilter = "all" | PubType;
type Sort = "cited" | "newest" | "oldest" | "alpha";
const typeIds: PubType[] = ["paper", "article", "conference", "study", "report"];

/** A publication, or an article shown alongside them, ready for filtering. */
type Item = Publication & {
  type: PubType;
  /** Theme (read from keywords for articles). */
  topic: PublicationCategory | null;
  /** Internal page for the full text, if any. */
  detail: string | null;
  index: string;
};

interface PublicationsProps {
  t: Dictionary["publications"];
  page: Dictionary["publicationsPage"];
  ui: Dictionary["ui"];
  discover: Dictionary["discover"];
  locale: Locale;
  publications: Publication[];
  /** Articles to include as their own type (the publications page). */
  articles?: Article[];
  scholarUrl: string;
  /** Home page: show this many and a "view all" link. */
  limit?: number;
  /** Render without the section heading (the page has its own hero). */
  bare?: boolean;
  /** Labels for the list / cards switch; the switch is hidden without them. */
  views?: Dictionary["views"];
}

type View = "list" | "cards";
const VIEW_KEY = "km-pub-view";

export function Publications({ t, page, ui, discover, locale, publications, articles, scholarUrl, limit, bare, views }: PublicationsProps) {
  const isAr = locale === "ar";
  const [view, setViewState] = React.useState<View>("list");
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (saved === "list" || saved === "cards") setViewState(saved);
    } catch {}
  }, []);
  const setView = (v: View) => {
    setViewState(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {}
  };
  const cards = Boolean(views) && view === "cards";
  const [topic, setTopic] = React.useState<Topic>("all");
  const [type, setType] = React.useState<TypeFilter>("all");
  const [year, setYear] = React.useState("all");
  const [sort, setSort] = React.useState<Sort>("cited");
  const [query, setQuery] = React.useState("");
  const deferredQuery = React.useDeferredValue(query);

  // Everything searchable (including full text) is normalized once, not on each keystroke.
  const all = React.useMemo<Item[]>(() => {
    const pubs: Item[] = publications.map((p) => ({
      ...p,
      type: publicationType(p),
      topic: p.category,
      detail: p.abstractAr ? href(locale, `/publications/${p.id}`) : null,
      index: searchIndex(p.title, p.titleAr, p.authors, p.authorsAr, p.venue, p.venueAr, p.year, p.ident, p.abstractAr),
    }));
    const arts: Item[] = (articles ?? []).map((a) => ({
      id: `article-${a.id}`,
      kind: "paper",
      title: a.titleEn || a.titleAr,
      titleAr: a.titleAr,
      authors: "",
      authorsAr: "",
      venue: a.venueEn,
      venueAr: a.venueAr,
      year: Number.parseInt(a.date, 10) || 0,
      citations: 0,
      category: "other",
      link: a.link,
      ident: "",
      abstractAr: "",
      type: "article",
      topic: topicFromText([a.titleEn, a.titleAr], [a.summaryEn, a.summaryAr]),
      detail: href(locale, `/articles/${a.id}`),
      index: searchIndex(a.titleEn, a.titleAr, a.summaryEn, a.summaryAr, a.venueEn, a.venueAr, a.date, a.bodyAr),
    }));
    return [...pubs, ...arts];
  }, [publications, articles, locale]);

  const titleOf = React.useCallback((p: Item) => (isAr && p.titleAr ? p.titleAr : p.title), [isAr]);

  const items = React.useMemo(() => {
    return all
      .filter((p) => topic === "all" || p.topic === topic)
      .filter((p) => type === "all" || p.type === type)
      .filter((p) => year === "all" || String(p.year) === year)
      .filter((p) => hit(p.index, deferredQuery))
      .sort((a, b) => {
        if (sort === "cited") return b.citations - a.citations || b.year - a.year;
        if (sort === "newest") return b.year - a.year || b.citations - a.citations;
        if (sort === "oldest") return a.year - b.year || b.citations - a.citations;
        return titleOf(a).localeCompare(titleOf(b), locale);
      });
  }, [all, topic, type, year, deferredQuery, sort, titleOf, locale]);

  const shown = limit ? items.slice(0, limit) : items;
  const active = topic !== "all" || type !== "all" || year !== "all" || query.trim() !== "";
  const reset = () => {
    setTopic("all");
    setType("all");
    setYear("all");
    setQuery("");
  };

  const typeOptions = [
    { id: "all" as TypeFilter, label: discover.allTypes, count: all.length },
    ...typeIds
      .map((id) => ({ id: id as TypeFilter, label: discover.types[id], count: all.filter((p) => p.type === id).length }))
      .filter((o) => o.count > 0),
  ];
  const topicOptions = [
    { id: "all" as Topic, label: discover.allTopics },
    ...categories.map((id) => ({ id: id as Topic, label: t.categories[id], count: all.filter((p) => p.topic === id).length })),
  ];
  const years = [...new Set(all.map((p) => p.year).filter(Boolean))].sort((a, b) => b - a);
  const yearOptions = [{ id: "all", label: discover.allYears }, ...years.map((y) => ({ id: String(y), label: String(y) }))];
  const sortOptions = (["cited", "newest", "oldest", "alpha"] as Sort[]).map((id) => ({ id, label: discover.sorts[id] }));

  const content = (
    <Reveal>
      <div role="search" aria-label={discover.filtersLabel} className="glass mb-6 grid min-w-0 gap-4 rounded-3xl p-4 sm:p-5 [&>*]:min-w-0">
        <SearchBox value={query} onChange={setQuery} label={t.searchLabel} placeholder={discover.pubSearchPlaceholder} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <SelectFilter label={discover.topic} value={topic} onChange={setTopic} options={topicOptions} />
          <SelectFilter label={discover.year} value={year} onChange={setYear} options={yearOptions} />
          <SelectFilter label={discover.sort} value={sort} onChange={setSort} options={sortOptions} className="col-span-2 sm:col-span-1" />
        </div>
        {typeOptions.length > 2 && (
          <FilterChips options={typeOptions} value={type} onChange={setType} label={discover.type} layoutId={`pub-type-${bare ? "page" : "home"}`} />
        )}
      </div>

      <div className="mb-4 grid gap-3">
        <ResultsBar
          template={discover.showing}
          shown={limit ? shown.length : items.length}
          total={all.length}
          noun={discover.nouns.publications}
          active={active}
          onReset={reset}
          resetLabel={discover.reset}
        >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {t.note && (
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="size-3.5 shrink-0" aria-hidden />
              {t.note}
            </p>
          )}
          {views && (
            <div role="group" aria-label={views.label} className="neu-inset flex rounded-full p-1">
              {(
                [
                  { id: "list", label: views.list, icon: List },
                  { id: "cards", label: views.cards, icon: LayoutGrid },
                ] as const
              ).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={view === v.id}
                  aria-label={v.label}
                  title={v.label}
                  onClick={() => setView(v.id)}
                  className={cn(
                    "relative grid size-8 place-items-center rounded-full transition-colors duration-300",
                    view === v.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {view === v.id && (
                    <motion.span
                      layoutId={`pub-view-${bare ? "page" : "home"}`}
                      className="absolute inset-0 rounded-full bg-surface shadow-sm dark:bg-white/10"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <v.icon className="relative size-4" aria-hidden />
                </button>
              ))}
            </div>
          )}
        </div>
        </ResultsBar>
      </div>

      <ul className={cn(cards ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "glass overflow-hidden rounded-3xl")}>
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((p) => {
            const title = isAr && p.titleAr ? p.titleAr : p.title;
            const titleLang = isAr && p.titleAr ? "ar" : p.title && /[a-z]/i.test(p.title) ? "en" : "ar";
            const authors = isAr && p.authorsAr ? p.authorsAr : p.authors;
            const venue = isAr && p.venueAr ? p.venueAr : p.venue;
            const detail = p.detail;
            const isArticle = p.type === "article";
            const badges = (
              <>
                {p.topic && <Badge variant="primary">{t.categories[p.topic]}</Badge>}
                {p.type !== "paper" && <Badge>{discover.types[p.type]}</Badge>}
              </>
            );
            const links = (detail || p.link) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {detail && (
                  <Link href={detail} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:border-primary/50 hover:text-primary">
                    <FileText className="size-3.5" aria-hidden /> {page.fullText}
                  </Link>
                )}
                {p.link && (
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:border-primary/50 hover:text-primary">
                    <ArrowUpRight className={cn("size-3.5", flipRtl)} aria-hidden /> {ui.externalSource}
                  </a>
                )}
              </div>
            );
            if (cards) {
              return (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: easeOutExpo }}
                  className="glass group relative flex overflow-hidden rounded-3xl transition-[translate,border-color] duration-500 hover:-translate-y-1 hover:border-primary/40"
                >
                  <span aria-hidden className="bg-brand absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" />
                  <article className="flex w-full flex-col p-6">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <p className="font-display text-3xl text-muted-foreground transition-colors duration-300 group-hover:text-primary">{p.year || "—"}</p>
                      {!isArticle && (
                        <p className="flex items-baseline gap-1.5 text-end">
                          <span className="font-display text-2xl tabular-nums">{p.citations}</span>
                          <span className="text-xs text-muted-foreground">{p.citations === 1 ? t.citationOne : t.citationMany}</span>
                        </p>
                      )}
                    </div>
                    <h3 lang={titleLang} className="line-clamp-4 text-base font-semibold leading-snug text-pretty">
                      {detail ? (
                        <Link href={detail} className="underline-offset-4 hover:text-primary hover:underline">
                          <bdi>{title}</bdi>
                        </Link>
                      ) : (
                        <bdi>{title}</bdi>
                      )}
                    </h3>
                    {authors && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        <bdi>{authors}</bdi>
                      </p>
                    )}
                    {venue && (
                      <p className="mt-1 line-clamp-2 text-sm italic text-muted-foreground/90 rtl:not-italic">
                        <bdi>{venue}</bdi>
                      </p>
                    )}
                    <div className="mt-auto pt-4">
                      <div className="flex flex-wrap gap-2">{badges}</div>
                      {links}
                    </div>
                  </article>
                </motion.li>
              );
            }
            return (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: easeOutExpo }}
                className="group relative border-b border-border last:border-b-0"
              >
                <span aria-hidden className="bg-brand absolute inset-y-0 start-0 w-0.5 origin-top scale-y-0 transition-transform duration-500 group-hover:scale-y-100" />
                <article className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 p-5 transition-colors duration-300 group-hover:bg-foreground/[0.025] sm:grid-cols-[4.5rem_1fr_auto] sm:gap-x-6 sm:p-7">
                  <p className="font-display text-2xl text-muted-foreground transition-colors duration-300 group-hover:text-primary sm:text-3xl">
                    {p.year || "—"}
                  </p>
                  <div className="col-span-2 row-start-2 min-w-0 sm:col-span-1 sm:row-start-auto">
                    <h3 lang={titleLang} className="text-base font-semibold leading-snug text-pretty sm:text-lg">
                      {detail ? (
                        <Link href={detail} className="underline-offset-4 hover:text-primary hover:underline">
                          <bdi>{title}</bdi>
                        </Link>
                      ) : (
                        <bdi>{title}</bdi>
                      )}
                    </h3>
                    {authors && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        <bdi>{authors}</bdi>
                      </p>
                    )}
                    {venue && (
                      <p className="mt-1 text-sm italic text-muted-foreground/90 rtl:not-italic">
                        <bdi>{venue}</bdi>
                      </p>
                    )}
                    {links}
                  </div>
                  <div className="flex items-center justify-end gap-3 sm:flex-col sm:items-end sm:justify-start sm:gap-2">
                    {!isArticle && (
                      <p className="flex items-baseline gap-1.5">
                        <span className="font-display text-2xl tabular-nums sm:text-3xl">{p.citations}</span>
                        <span className="text-xs text-muted-foreground">{p.citations === 1 ? t.citationOne : t.citationMany}</span>
                      </p>
                    )}
                    {badges}
                  </div>
                </article>
              </motion.li>
            );
          })}
        </AnimatePresence>

        {items.length === 0 && (
          <li className={cn(cards && "glass col-span-full rounded-3xl")}>
            <EmptyResults title={discover.emptyPublications} hint={discover.emptyHint} resetLabel={discover.reset} onReset={reset} />
          </li>
        )}
      </ul>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {limit && items.length > limit && (
          <Button asChild variant="brand">
            <Link href={href(locale, "/publications")}>
              {ui.viewAll} ({items.length}) <ArrowRight className={cn(arrowNudge, flipRtl)} />
            </Link>
          </Button>
        )}
        {scholarUrl && (
          <Button asChild variant="outline">
            <a href={scholarUrl} target="_blank" rel="noopener noreferrer">
              {t.scholarCta}
              <ArrowUpRight className={cn(arrowNudge, flipRtl)} />
            </a>
          </Button>
        )}
      </div>
    </Reveal>
  );

  if (bare) return <div className="container-page pb-24">{content}</div>;

  return (
    <Section id="publications">
      <SectionHeading id="publications" index="06" eyebrow={t.eyebrow} title={t.title} description={t.description} />
      {content}
    </Section>
  );
}
