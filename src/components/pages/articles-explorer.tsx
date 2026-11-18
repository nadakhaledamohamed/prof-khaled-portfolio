"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { FilterChips, matches, SearchBox } from "@/components/ui/filters";
import type { Dictionary } from "@/content/types";
import { fmt, type Locale } from "@/i18n/config";
import { easeOutExpo } from "@/lib/utils";
import type { Article } from "@/types";
import { ArticleCard } from "./article-card";

/** Searchable article list; the newest article is featured while no filter is active. */
export function ArticlesExplorer({ articles, locale, t }: { articles: Article[]; locale: Locale; t: Pick<Dictionary, "ui" | "articlesPage"> }) {
  const [query, setQuery] = React.useState("");
  const isAr = locale === "ar";
  const years = Array.from(new Set(articles.map((a) => a.date.slice(0, 4)).filter(Boolean))).sort().reverse();
  const [year, setYear] = React.useState("all");

  const items = articles.filter(
    (a) =>
      (year === "all" || a.date.startsWith(year)) &&
      matches(query, a.titleEn, a.titleAr, a.summaryEn, a.summaryAr, a.venueEn, a.venueAr),
  );
  const featured = !query && year === "all" ? items[0] : null;
  const rest = featured ? items.slice(1) : items;

  return (
    <div className="container-page pb-24">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {years.length > 1 ? (
          <FilterChips
            options={[{ id: "all", label: t.ui.all, count: articles.length }, ...years.map((y) => ({ id: y, label: y }))]}
            value={year}
            onChange={setYear}
            label={t.ui.search}
            layoutId="article-year"
          />
        ) : (
          <span />
        )}
        <SearchBox value={query} onChange={setQuery} label={t.ui.search} placeholder={t.ui.searchPlaceholder} className="lg:w-80" />
      </div>
      <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground" aria-live="polite">
        {fmt(t.ui.results, { n: items.length })}
      </p>

      {featured && (
        <div className="mb-6">
          <ArticleCard article={featured} locale={locale} readLabel={t.articlesPage.readArticle} featured />
        </div>
      )}

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {rest.map((article) => (
            <motion.li
              key={article.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, ease: easeOutExpo }}
            >
              <ArticleCard article={article} locale={locale} readLabel={t.articlesPage.readArticle} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {items.length === 0 && (
        <div className="glass flex flex-col items-center gap-3 rounded-3xl px-6 py-16 text-center">
          <SearchX className="size-8 text-muted-foreground" aria-hidden />
          <p className="font-medium">{t.ui.noResults}</p>
        </div>
      )}
      {!isAr && <p className="mt-8 text-center text-sm text-muted-foreground">{t.ui.arabicOnly}</p>}
    </div>
  );
}
