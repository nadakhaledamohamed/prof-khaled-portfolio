"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Globe, SearchX } from "lucide-react";
import { FilterChips, matches, SearchBox } from "@/components/ui/filters";
import type { Dictionary } from "@/content/types";
import { fmt, type Locale } from "@/i18n/config";
import { cn, easeOutExpo, flipRtl } from "@/lib/utils";
import type { OpenResource } from "@/types";

/** Open repositories, grouped by type, searchable. */
export function OpenLibrary({ resources, locale, t }: { resources: OpenResource[]; locale: Locale; t: Pick<Dictionary, "ui" | "libraryPage"> }) {
  const isAr = locale === "ar";
  const [query, setQuery] = React.useState("");
  const groupNames = Array.from(new Set(resources.map((r) => r.groupEn)));
  const [group, setGroup] = React.useState("all");

  const items = resources.filter(
    (r) => (group === "all" || r.groupEn === group) && matches(query, r.title, r.summaryEn, r.summaryAr, r.groupEn, r.groupAr, r.link),
  );
  const grouped = groupNames
    .map((name) => ({ name, label: (isAr ? resources.find((r) => r.groupEn === name)?.groupAr : name) || name, items: items.filter((r) => r.groupEn === name) }))
    .filter((g) => g.items.length);

  const host = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterChips
          options={[
            { id: "all", label: t.ui.all, count: resources.length },
            ...groupNames.map((name) => ({
              id: name,
              label: (isAr ? resources.find((r) => r.groupEn === name)?.groupAr : name) || name,
              count: resources.filter((r) => r.groupEn === name).length,
            })),
          ]}
          value={group}
          onChange={setGroup}
          label={t.libraryPage.groups}
          layoutId="lib-group"
        />
        <SearchBox value={query} onChange={setQuery} label={t.ui.search} placeholder={t.ui.searchPlaceholder} className="shrink-0 lg:w-72" />
      </div>
      <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground" aria-live="polite">
        {fmt(t.ui.results, { n: items.length })}
      </p>

      <div className="grid gap-12">
        {grouped.map((g) => (
          <section key={g.name} aria-labelledby={`grp-${g.name}`}>
            <h2 id={`grp-${g.name}`} className="mb-5 flex items-center gap-3 font-display text-2xl font-medium">
              <span aria-hidden className="bg-brand h-px w-8" />
              {g.label}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {g.items.map((r) => (
                  <motion.li key={r.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: easeOutExpo }}>
                    <a
                      href={r.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass group flex h-full flex-col rounded-3xl p-6 transition-[translate,border-color] duration-500 hover:-translate-y-1 hover:border-primary/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="neu grid size-11 shrink-0 place-items-center rounded-2xl text-primary">
                          <Globe className="size-5" aria-hidden />
                        </span>
                        <span className="font-mono text-xs text-muted-foreground/70">{String(r.num).padStart(2, "0")}</span>
                      </div>
                      <h3 lang="en" dir="ltr" className="mt-5 text-start font-semibold leading-snug transition-colors group-hover:text-primary rtl:text-end">
                        {r.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{isAr ? r.summaryAr : r.summaryEn}</p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs text-muted-foreground transition-colors group-hover:text-primary">
                        <span dir="ltr">{host(r.link)}</span>
                        <ArrowUpRight className={cn("size-3.5", flipRtl)} aria-hidden />
                        <span className="sr-only">({t.libraryPage.visit})</span>
                      </span>
                    </a>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </section>
        ))}
      </div>

      {items.length === 0 && (
        <div className="glass flex flex-col items-center gap-3 rounded-3xl px-6 py-16 text-center">
          <SearchX className="size-8 text-muted-foreground" aria-hidden />
          <p className="font-medium">{t.ui.noResults}</p>
        </div>
      )}
    </div>
  );
}
