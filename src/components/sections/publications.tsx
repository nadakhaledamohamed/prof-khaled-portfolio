"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Info, Search, SearchX } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/content/types";
import { categories } from "@/data/site";
import { fmt } from "@/i18n/config";
import { arrowNudge, cn, easeOutExpo, flipRtl } from "@/lib/utils";
import type { Publication, PublicationCategory } from "@/types";

type Filter = "all" | PublicationCategory;
type Sort = "citations" | "newest" | "oldest";
const sortIds: Sort[] = ["citations", "newest", "oldest"];

export function Publications({
  t,
  publications,
  scholarUrl,
}: {
  t: Dictionary["publications"];
  publications: Publication[];
  scholarUrl: string;
}) {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [sort, setSort] = React.useState<Sort>("citations");
  const [query, setQuery] = React.useState("");

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: t.all },
    ...categories.map((id) => ({ id, label: t.categories[id] })),
  ];

  const items = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return publications
      .filter((p) => filter === "all" || p.category === filter)
      .filter(
        (p) =>
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.authors.toLowerCase().includes(q) ||
          p.venue.toLowerCase().includes(q) ||
          String(p.year).includes(q),
      )
      .sort((a, b) => {
        if (sort === "citations") return b.citations - a.citations || b.year - a.year;
        if (sort === "newest") return b.year - a.year || b.citations - a.citations;
        return a.year - b.year || b.citations - a.citations;
      });
  }, [publications, filter, sort, query]);

  return (
    <Section id="publications">
      <SectionHeading
        id="publications"
        index="06"
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />

      <Reveal>
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label={t.filterLabel}
            className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {filters.map((f) => {
              const selected = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "relative shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors duration-300 active:scale-95",
                    selected
                      ? "border-transparent text-background"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId="pub-filter"
                      className="absolute inset-0 rounded-full bg-foreground"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{f.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <label className="relative flex-1 lg:w-64 lg:flex-none">
              <span className="sr-only">{t.searchLabel}</span>
              <Search
                aria-hidden
                className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="h-10 w-full rounded-full border border-border bg-background/60 pe-4 ps-10 text-sm transition-[border-color,box-shadow] duration-300 placeholder:text-muted-foreground/70 hover:border-foreground/25 focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_16%,transparent)] focus:outline-none"
              />
            </label>
            <label className="relative shrink-0">
              <span className="sr-only">{t.sortLabel}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-10 appearance-none rounded-full border border-border bg-background/60 pe-9 ps-4 text-sm font-medium transition-colors duration-300 hover:border-foreground/25 focus:border-primary focus:outline-none"
              >
                {sortIds.map((id) => (
                  <option key={id} value={id} className="bg-surface text-foreground">
                    {t.sorts[id]}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
            </label>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
            aria-live="polite"
          >
            {fmt(items.length === 1 ? t.countOne : t.countMany, { n: items.length })}
          </p>
          {t.note && (
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="size-3.5 shrink-0" aria-hidden />
              {t.note}
            </p>
          )}
        </div>

        <ul className="glass overflow-hidden rounded-3xl">
          <AnimatePresence initial={false} mode="popLayout">
            {items.map((p) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: easeOutExpo }}
                className="group relative border-b border-border last:border-b-0"
              >
                <span
                  aria-hidden
                  className="bg-brand absolute inset-y-0 start-0 w-0.5 origin-top scale-y-0 transition-transform duration-500 group-hover:scale-y-100"
                />
                <article className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 p-5 transition-colors duration-300 group-hover:bg-foreground/[0.025] sm:grid-cols-[4.5rem_1fr_auto] sm:gap-x-6 sm:p-7">
                  <p className="font-display text-2xl text-muted-foreground transition-colors duration-300 group-hover:text-primary sm:text-3xl">
                    {p.year}
                  </p>
                  <div lang="en" className="col-span-2 row-start-2 min-w-0 sm:col-span-1 sm:row-start-auto">
                    <h3 className="text-base font-semibold leading-snug text-pretty sm:text-lg">
                      <bdi>{p.title}</bdi>
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      <bdi>{p.authors}</bdi>
                    </p>
                    <p className="mt-1 text-sm italic text-muted-foreground/90">
                      <bdi>{p.venue}</bdi>
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-3 sm:flex-col sm:items-end sm:justify-start sm:gap-2">
                    <p className="flex items-baseline gap-1.5">
                      <span className="font-display text-2xl tabular-nums sm:text-3xl">
                        {p.citations}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {p.citations === 1 ? t.citationOne : t.citationMany}
                      </span>
                    </p>
                    <Badge variant="primary">{t.categories[p.category]}</Badge>
                  </div>
                </article>
              </motion.li>
            ))}
          </AnimatePresence>

          {items.length === 0 && (
            <li className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <SearchX className="size-8 text-muted-foreground" aria-hidden />
              <p className="font-medium">{t.emptyTitle}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                {t.clearFilters}
              </Button>
            </li>
          )}
        </ul>

        {scholarUrl && (
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline">
            <a href={scholarUrl} target="_blank" rel="noopener noreferrer">
              {t.scholarCta}
              <ArrowUpRight className={cn(arrowNudge, flipRtl)} />
            </a>
          </Button>
        </div>
        )}
      </Reveal>
    </Section>
  );
}
