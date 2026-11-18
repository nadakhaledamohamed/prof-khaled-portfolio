"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronDown, FileText, Info, LayoutGrid, List, SearchX } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterChips, matches, SearchBox } from "@/components/ui/filters";
import type { Dictionary } from "@/content/types";
import { categories } from "@/data/site";
import { fmt, href, type Locale } from "@/i18n/config";
import { arrowNudge, cn, easeOutExpo, flipRtl } from "@/lib/utils";
import type { Publication, PublicationCategory } from "@/types";

type Filter = "all" | PublicationCategory;
type Kind = "all" | Publication["kind"];
type Sort = "citations" | "newest" | "oldest";
const sortIds: Sort[] = ["citations", "newest", "oldest"];

interface PublicationsProps {
  t: Dictionary["publications"];
  page: Dictionary["publicationsPage"];
  ui: Dictionary["ui"];
  locale: Locale;
  publications: Publication[];
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

export function Publications({ t, page, ui, locale, publications, scholarUrl, limit, bare, views }: PublicationsProps) {
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
  const [filter, setFilter] = React.useState<Filter>("all");
  const [kind, setKind] = React.useState<Kind>("all");
  const [sort, setSort] = React.useState<Sort>("citations");
  const [query, setQuery] = React.useState("");

  const filters = [
    { id: "all" as Filter, label: t.all, count: publications.length },
    ...categories.map((id) => ({ id: id as Filter, label: t.categories[id], count: publications.filter((p) => p.category === id).length })),
  ];
  const kinds = (["all", "paper", "study"] as Kind[]).map((id) => ({
    id,
    label: page.kinds[id],
    count: id === "all" ? publications.length : publications.filter((p) => p.kind === id).length,
  }));

  const items = React.useMemo(() => {
    return publications
      .filter((p) => filter === "all" || p.category === filter)
      .filter((p) => kind === "all" || p.kind === kind)
      .filter((p) => matches(query, p.title, p.titleAr, p.authors, p.authorsAr, p.venue, p.venueAr, String(p.year)))
      .sort((a, b) => {
        if (sort === "citations") return b.citations - a.citations || b.year - a.year;
        if (sort === "newest") return b.year - a.year || b.citations - a.citations;
        return a.year - b.year || b.citations - a.citations;
      });
  }, [publications, filter, kind, sort, query]);

  const shown = limit ? items.slice(0, limit) : items;

  const content = (
    <Reveal>
      <div className="mb-6 grid min-w-0 gap-4 [&>*]:min-w-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterChips options={filters} value={filter} onChange={setFilter} label={t.filterLabel} layoutId={`pub-filter-${bare ? "page" : "home"}`} />
          <div className="flex gap-2">
            <SearchBox value={query} onChange={setQuery} label={t.searchLabel} placeholder={t.searchPlaceholder} className="flex-1 lg:w-72 lg:flex-none" />
            <label className="relative shrink-0">
              <span className="sr-only">{t.sortLabel}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-12 appearance-none rounded-full border border-border bg-background/60 pe-9 ps-4 text-sm font-medium transition-colors duration-300 hover:border-foreground/25 focus:border-primary focus:outline-none"
              >
                {sortIds.map((id) => (
                  <option key={id} value={id} className="bg-surface text-foreground">
                    {t.sorts[id]}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </label>
          </div>
        </div>
        {bare && <FilterChips options={kinds} value={kind} onChange={setKind} label={page.kinds.all} layoutId="pub-kind" />}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground" aria-live="polite">
          {fmt(items.length === 1 ? t.countOne : t.countMany, { n: items.length })}
        </p>
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
      </div>

      <ul className={cn(cards ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "glass overflow-hidden rounded-3xl")}>
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((p) => {
            const title = isAr && p.titleAr ? p.titleAr : p.title;
            const titleLang = isAr && p.titleAr ? "ar" : p.title && /[a-z]/i.test(p.title) ? "en" : "ar";
            const authors = isAr && p.authorsAr ? p.authorsAr : p.authors;
            const venue = isAr && p.venueAr ? p.venueAr : p.venue;
            const detail = p.abstractAr ? href(locale, `/publications/${p.id}`) : null;
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
                      <p className="flex items-baseline gap-1.5 text-end">
                        <span className="font-display text-2xl tabular-nums">{p.citations}</span>
                        <span className="text-xs text-muted-foreground">{p.citations === 1 ? t.citationOne : t.citationMany}</span>
                      </p>
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
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="primary">{t.categories[p.category]}</Badge>
                        {p.kind === "study" && <Badge>{page.kinds.study}</Badge>}
                      </div>
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
                    <p className="flex items-baseline gap-1.5">
                      <span className="font-display text-2xl tabular-nums sm:text-3xl">{p.citations}</span>
                      <span className="text-xs text-muted-foreground">{p.citations === 1 ? t.citationOne : t.citationMany}</span>
                    </p>
                    <Badge variant="primary">{t.categories[p.category]}</Badge>
                    {p.kind === "study" && <Badge>{page.kinds.study}</Badge>}
                  </div>
                </article>
              </motion.li>
            );
          })}
        </AnimatePresence>

        {items.length === 0 && (
          <li className={cn("flex flex-col", cards && "glass col-span-full rounded-3xl")}>
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <SearchX className="size-8 text-muted-foreground" aria-hidden />
            <p className="font-medium">{t.emptyTitle}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery("");
                setFilter("all");
                setKind("all");
              }}
            >
              {t.clearFilters}
            </Button>
            </div>
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
