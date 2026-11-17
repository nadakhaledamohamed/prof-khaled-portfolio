"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, CalendarRange, Layers, Quote, TrendingUp, type LucideIcon } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Counter } from "@/components/motion/counter";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Rich } from "@/components/rich";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { Dictionary } from "@/content/types";
import type { Stats } from "@/data/site";
import { fmt, type Locale } from "@/i18n/config";
import { cn, easeOutExpo } from "@/lib/utils";
import type { MetricId, MetricValue, PublicationCategory } from "@/types";

const metricIcons: Record<MetricId, LucideIcon> = {
  citations: Quote,
  "h-index": TrendingUp,
  "i10-index": BarChart3,
  years: CalendarRange,
};

const viewIds = ["works", "themes", "years"] as const;
type ViewId = (typeof viewIds)[number];
const viewIcons: Record<ViewId, LucideIcon> = {
  works: BarChart3,
  themes: Layers,
  years: CalendarRange,
};

/** Horizontal bar that grows from zero (from the inline start) when its panel mounts. */
function Bar({ ratio, delay }: { ratio: number; delay: number }) {
  return (
    <div className="neu-inset h-2.5 w-full overflow-hidden rounded-full">
      <motion.div
        className="bg-brand h-full origin-left rounded-full rtl:origin-right"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.1, delay, ease: easeOutExpo }}
        style={{ width: `${Math.max(ratio * 100, 3)}%` }}
      />
    </div>
  );
}

function WorksView({ t, topCited }: { t: Dictionary["impact"]; topCited: Stats["topCited"] }) {
  const max = topCited[0]?.citations ?? 1;
  return (
    <ol className="space-y-5">
      {topCited.map((work, i) => (
        <li key={work.title}>
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <p className="min-w-0 text-sm font-medium leading-snug sm:text-[15px]">
              <span className="me-2 font-mono text-xs text-muted-foreground">{work.year}</span>
              <bdi lang="en">{work.title}</bdi>
            </p>
            <p className="shrink-0 font-display text-xl tabular-nums">
              {work.citations}
              <span className="sr-only">{t.citationsSr}</span>
            </p>
          </div>
          <Bar ratio={work.citations / max} delay={i * 0.07} />
        </li>
      ))}
    </ol>
  );
}

function ThemesView({
  t,
  categories,
  themeStats,
}: {
  t: Dictionary["impact"];
  categories: Record<PublicationCategory, string>;
  themeStats: Stats["themeStats"];
}) {
  return (
    <ul className="space-y-8">
      {themeStats.map((theme, i) => (
        <li key={theme.category}>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="font-display text-xl sm:text-2xl">{categories[theme.category]}</p>
            <p className="text-sm text-muted-foreground">
              <Rich
                text={fmt(t.worksAndCitations, { works: theme.works, citations: theme.citations })}
              />
            </p>
          </div>
          <Bar ratio={theme.share} delay={i * 0.1} />
          <p className="mt-2 text-xs text-muted-foreground">
            {fmt(t.share, { pct: Math.round(theme.share * 100) })}
          </p>
        </li>
      ))}
    </ul>
  );
}

function YearsView({ t, yearStats }: { t: Dictionary["impact"]; yearStats: Stats["yearStats"] }) {
  const max = Math.max(...yearStats.map((y) => y.works), 1);
  const [focused, setFocused] = React.useState<number | null>(null);
  const current = yearStats.find((y) => y.year === focused);
  const detail = (y: (typeof yearStats)[number]) =>
    fmt(t.yearDetail, { year: y.year, works: y.works, citations: y.citations });

  return (
    <div>
      <p className="mb-6 min-h-10 text-sm text-muted-foreground" aria-live="polite">
        {current ? <Rich text={detail(current)} /> : t.yearsHint}
      </p>
      <ul className="flex h-52 items-end gap-1 sm:gap-2" onPointerLeave={() => setFocused(null)}>
        {yearStats.map((y, i) => (
          <li key={y.year} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <button
              type="button"
              disabled={y.works === 0}
              onPointerEnter={() => y.works > 0 && setFocused(y.year)}
              onFocus={() => setFocused(y.year)}
              onBlur={() => setFocused(null)}
              aria-label={detail(y).replace(/\*/g, "")}
              className="group flex h-full w-full flex-col justify-end rounded-lg disabled:cursor-default"
            >
              <motion.span
                className={cn(
                  "block w-full origin-bottom rounded-t-md transition-[filter,opacity] duration-300 sm:rounded-t-lg",
                  y.works === 0 ? "bg-border" : "bg-brand",
                  focused !== null && focused !== y.year && "opacity-40",
                )}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.9, delay: i * 0.035, ease: easeOutExpo }}
                style={{ height: y.works === 0 ? 3 : `${(y.works / max) * 100}%` }}
              />
            </button>
            <span
              className={cn(
                "mt-2 text-center font-mono text-[9px] text-muted-foreground sm:text-[10px]",
                i % 3 !== 0 && "max-sm:invisible",
              )}
            >
              &apos;{String(y.year).slice(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ImpactProps {
  t: Dictionary["impact"];
  categories: Record<PublicationCategory, string>;
  locale: Locale;
  metrics: MetricValue[];
  stats: Stats;
}

export function Impact({ t, categories, locale, metrics, stats }: ImpactProps) {
  const [view, setView] = React.useState<ViewId>("works");
  const rtl = locale === "ar";

  function onTabKey(event: React.KeyboardEvent) {
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    const delta = event.key === forward ? 1 : event.key === back ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const index = viewIds.indexOf(view);
    const next = viewIds[(index + delta + viewIds.length) % viewIds.length];
    setView(next);
    document.getElementById(`impact-tab-${next}`)?.focus();
  }

  return (
    <Section id="impact">
      <SectionHeading id="impact" index="02" eyebrow={t.eyebrow} title={t.title} />

      <Stagger role="list" className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metricIcons[metric.id];
          const copy = t.metrics[metric.id];
          return (
            <StaggerItem key={metric.id} role="listitem">
              <SpotlightCard className="h-full p-5 sm:p-7">
                <div className="neu mb-6 grid size-11 place-items-center rounded-2xl text-primary transition-transform duration-500 group-hover/spot:rotate-[-8deg] group-hover/spot:scale-110">
                  <Icon className="size-5" aria-hidden />
                </div>
                <p className="font-display text-5xl font-medium tracking-tight sm:text-6xl">
                  <Counter value={metric.value} suffix={metric.suffix} />
                </p>
                <p className="mt-3 text-sm font-semibold">{copy.label}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {copy.description}
                </p>
              </SpotlightCard>
            </StaggerItem>
          );
        })}
      </Stagger>

      <Reveal className="mt-5">
        <div className="glass rounded-3xl p-5 sm:p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-2xl font-medium">{t.dashboardTitle}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.dashboardSubtitle}</p>
            </div>
            <div
              role="tablist"
              aria-label={t.tablistLabel}
              onKeyDown={onTabKey}
              className="neu-inset flex w-full rounded-full p-1 sm:w-auto"
            >
              {viewIds.map((id) => {
                const selected = id === view;
                const Icon = viewIcons[id];
                return (
                  <button
                    key={id}
                    id={`impact-tab-${id}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls="impact-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setView(id)}
                    className={cn(
                      "relative flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-[13px] font-medium transition-colors duration-300 sm:flex-none sm:px-4",
                      selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {selected && (
                      <motion.span
                        layoutId="impact-tab"
                        className="absolute inset-0 rounded-full bg-surface shadow-sm dark:bg-white/10"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <Icon className="relative size-3.5 max-[380px]:hidden" aria-hidden />
                    <span className="relative">{t.tabs[id]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            id="impact-panel"
            role="tabpanel"
            aria-labelledby={`impact-tab-${view}`}
            className="min-h-[21rem]"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.3 }}
              >
                {view === "works" && <WorksView t={t} topCited={stats.topCited} />}
                {view === "themes" && (
                  <ThemesView t={t} categories={categories} themeStats={stats.themeStats} />
                )}
                {view === "years" && <YearsView t={t} yearStats={stats.yearStats} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
