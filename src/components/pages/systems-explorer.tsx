"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Coins, Gauge, LifeBuoy, MousePointerClick, Puzzle, SearchX, Sparkles, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FilterChips, matches, SearchBox } from "@/components/ui/filters";
import type { Dictionary } from "@/content/types";
import { fmt, type Locale } from "@/i18n/config";
import { cn, easeOutExpo, flipRtl } from "@/lib/utils";
import type { SystemCategory, SystemReview } from "@/types";

type Cat = "all" | SystemCategory;
type Lic = "all" | SystemReview["license"];

const indicatorIcons: Record<keyof Dictionary["systemsPage"]["indicators"], LucideIcon> = {
  func: Puzzle,
  use: MousePointerClick,
  perf: Gauge,
  cost: Coins,
  support: LifeBuoy,
};

export function SystemsExplorer({ systems, locale, t }: { systems: SystemReview[]; locale: Locale; t: Pick<Dictionary, "ui" | "systemsPage"> }) {
  const isAr = locale === "ar";
  const s = t.systemsPage;
  const [cat, setCat] = React.useState<Cat>("all");
  const [lic, setLic] = React.useState<Lic>("all");
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState<string | null>(null);
  const pick = (en: string, ar: string) => (isAr ? ar || en : en || ar);

  const licenses = Array.from(new Set(systems.map((x) => x.license)));
  const items = systems.filter(
    (x) =>
      (cat === "all" || x.cats.includes(cat)) &&
      (lic === "all" || x.license === lic) &&
      matches(query, x.nameEn, x.nameAr, x.fullNameEn, x.fullNameAr, x.funcEn, x.funcAr, x.noteEn, x.noteAr),
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterChips
          options={(["all", "ils", "repo", "access"] as Cat[]).map((id) => ({
            id,
            label: id === "all" ? t.ui.all : s.cats[id],
            count: id === "all" ? systems.length : systems.filter((x) => x.cats.includes(id)).length,
          }))}
          value={cat}
          onChange={setCat}
          label={s.category}
          layoutId="sys-cat"
        />
        <SearchBox value={query} onChange={setQuery} label={t.ui.search} placeholder={t.ui.searchPlaceholder} className="lg:w-72" />
      </div>
      <FilterChips
        options={[{ id: "all" as Lic, label: t.ui.all }, ...licenses.map((id) => ({ id: id as Lic, label: s.licenses[id], count: systems.filter((x) => x.license === id).length }))]}
        value={lic}
        onChange={setLic}
        label={s.license}
        layoutId="sys-lic"
        className="mb-6"
      />
      <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground" aria-live="polite">
        {fmt(t.ui.results, { n: items.length })}
      </p>

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((x) => {
            const expanded = open === x.id;
            const indicators = (Object.keys(s.indicators) as (keyof typeof s.indicators)[])
              .map((key) => ({ key, text: pick(x[`${key}En`], x[`${key}Ar`]) }))
              .filter((i) => i.text);
            const name = pick(x.nameEn, x.nameAr);
            const full = pick(x.fullNameEn, x.fullNameAr);
            return (
              <motion.li
                key={x.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, ease: easeOutExpo }}
              >
                <article className={cn("glass flex h-full flex-col rounded-3xl p-6 transition-[border-color] duration-500 hover:border-primary/40", x.highlight && "border-primary/40")}>
                  <header className="flex items-start gap-4">
                    <span className="neu grid size-12 shrink-0 place-items-center rounded-2xl font-display text-lg font-medium text-primary tabular-nums">
                      {x.num}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-medium leading-snug">{name}</h3>
                      {full !== name && <p className="mt-0.5 text-xs text-muted-foreground">{full}</p>}
                    </div>
                  </header>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {x.highlight && (
                      <Badge variant="accent">
                        <Sparkles className="size-3" aria-hidden /> {s.highlight}
                      </Badge>
                    )}
                    <Badge variant="primary">{s.licenses[x.license]}</Badge>
                    {x.cats.map((c) => (
                      <Badge key={c}>{s.cats[c]}</Badge>
                    ))}
                  </div>
                  {indicators[0] && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{indicators[0].text}</p>}

                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : x.id)}
                    aria-expanded={expanded}
                    className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary"
                  >
                    {s.reportOpen}
                    <ChevronDown className={cn("size-4 transition-transform duration-300", expanded && "rotate-180")} aria-hidden />
                  </button>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.dl
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 grid gap-3 overflow-hidden"
                      >
                        {indicators.map(({ key, text }) => {
                          const Icon = indicatorIcons[key];
                          return (
                            <div key={key} className="flex gap-3 rounded-2xl bg-foreground/[0.03] p-3 dark:bg-white/[0.03]">
                              <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                              <div>
                                <dt className="text-xs font-semibold">{s.indicators[key]}</dt>
                                <dd className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{text}</dd>
                              </div>
                            </div>
                          );
                        })}
                        {(x.noteEn || x.noteAr) && <p className="text-xs leading-relaxed text-muted-foreground">{pick(x.noteEn, x.noteAr)}</p>}
                        {(x.strengthsEn || x.strengthsAr) && <p className="text-sm leading-relaxed">{pick(x.strengthsEn, x.strengthsAr)}</p>}
                      </motion.dl>
                    )}
                  </AnimatePresence>

                  {x.link && (
                    <a
                      href={x.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center gap-1.5 self-start pt-5 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {s.visit} <ArrowUpRight className={cn("size-3.5", flipRtl)} aria-hidden />
                    </a>
                  )}
                </article>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      {items.length === 0 && (
        <div className="glass flex flex-col items-center gap-3 rounded-3xl px-6 py-16 text-center">
          <SearchX className="size-8 text-muted-foreground" aria-hidden />
          <p className="font-medium">{t.ui.noResults}</p>
        </div>
      )}
    </div>
  );
}
