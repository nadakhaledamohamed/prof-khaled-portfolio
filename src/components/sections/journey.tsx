"use client";

import * as React from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Briefcase, GraduationCap, MapPin, type LucideIcon } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import type { Dictionary } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";
import { cn, easeOutExpo } from "@/lib/utils";
import type { TimelineEntry } from "@/types";

type Track = "experience" | "education";

/**
 * Timeline whose spine draws itself as it scrolls through the viewport.
 * Desktop: centred spine, cards alternate sides. Mobile: spine on the inline start.
 */
function Timeline({ entries, rtl, current }: { entries: TimelineEntry[]; rtl: boolean; current?: string }) {
  const ref = React.useRef<HTMLOListElement>(null);
  const reduce = useSafeReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.4 });

  return (
    <ol ref={ref} className="relative">
      {/* Spine */}
      <span aria-hidden className="absolute bottom-0 start-[19px] top-0 w-px bg-border lg:start-1/2" />
      <motion.span
        aria-hidden
        className="bg-brand absolute bottom-0 start-[19px] top-0 w-0.5 origin-top lg:start-1/2 lg:-ms-px"
        style={reduce ? undefined : { scaleY }}
      />

      {entries.map((entry, i) => {
        const left = i % 2 === 0;
        const isCurrent = entry.period === current;
        return (
          <li key={`${entry.period}-${entry.title}`} className="relative grid pb-10 ps-14 last:pb-0 lg:grid-cols-2 lg:gap-16 lg:ps-0">
            {/* Node with the period */}
            <motion.span
              aria-hidden
              className={cn(
                "absolute start-0 top-1 z-10 grid size-10 place-items-center rounded-full border bg-background text-[10px] font-semibold lg:start-1/2 lg:-ms-5",
                isCurrent ? "border-transparent shadow-[0_0_0_6px_color-mix(in_srgb,var(--primary)_15%,transparent)]" : "border-border",
              )}
              initial={reduce ? false : { scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: "0px 0px -60px 0px" }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <span className={cn("size-3 rounded-full", isCurrent ? "bg-brand animate-pulse" : "bg-primary/70")} />
            </motion.span>

            <motion.div
              className={cn("lg:col-span-1", left ? "lg:col-start-1 lg:text-end" : "lg:col-start-2")}
              initial={reduce ? false : { opacity: 0, x: (left ? -40 : 40) * (rtl ? -1 : 1), y: 10 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              transition={{ duration: 0.8, ease: easeOutExpo }}
            >
              <div
                className={cn(
                  "glass group rounded-3xl p-5 transition-[translate,border-color] duration-500 hover:-translate-y-1 hover:border-primary/40 sm:p-6",
                  isCurrent && "border-primary/40",
                )}
              >
                <p className={cn("mb-3 flex flex-wrap items-center gap-2", left && "lg:justify-end")}>
                  <span className="bg-brand inline-flex rounded-full px-3 py-1 font-mono text-xs font-semibold text-white dark:text-[#070a12]">
                    {entry.period}
                  </span>
                </p>
                <h4 className="text-lg font-semibold leading-snug text-balance">{entry.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{entry.organization}</p>
                {entry.location && (
                  <p className={cn("mt-2 flex items-center gap-1.5 text-xs text-muted-foreground", left && "lg:justify-end")}>
                    <MapPin className="size-3.5" aria-hidden />
                    {entry.location}
                  </p>
                )}
                {entry.note && (
                  <p className="mt-3 border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">{entry.note}</p>
                )}
              </div>
            </motion.div>
          </li>
        );
      })}
    </ol>
  );
}

export function Journey({ t, locale }: { t: Dictionary["journey"]; locale: Locale }) {
  const rtl = locale === "ar";
  const [track, setTrack] = React.useState<Track>("experience");
  const tabs: { id: Track; label: string; icon: LucideIcon; count: number }[] = [
    { id: "experience", label: t.experienceTitle, icon: Briefcase, count: t.experience.length },
    { id: "education", label: t.educationTitle, icon: GraduationCap, count: t.education.length },
  ];
  const entries = track === "experience" ? t.experience : t.education;
  const years = [...t.experience, ...t.education]
    .flatMap((e) => e.period.match(/\d{4}/g) ?? [])
    .map(Number);
  const firstYear = years.length ? Math.min(...years) : null;

  function onKey(event: React.KeyboardEvent) {
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    if (event.key !== forward && event.key !== back) return;
    event.preventDefault();
    const next: Track = track === "experience" ? "education" : "experience";
    setTrack(next);
    document.getElementById(`journey-tab-${next}`)?.focus();
  }

  return (
    <Section id="journey">
      <SectionHeading id="journey" index="03" eyebrow={t.eyebrow} title={t.title} description={t.description} />

      <div className="mb-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label={t.eyebrow} onKeyDown={onKey} className="neu-inset flex rounded-full p-1">
          {tabs.map((tab) => {
            const selected = tab.id === track;
            return (
              <button
                key={tab.id}
                id={`journey-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="journey-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setTrack(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300",
                  selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="journey-tab"
                    className="absolute inset-0 rounded-full bg-surface shadow-sm dark:bg-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <tab.icon className="relative size-4" aria-hidden />
                <span className="relative">{tab.label}</span>
                <span className="relative font-mono text-xs text-muted-foreground">{tab.count}</span>
              </button>
            );
          })}
        </div>
        {firstYear && (
          <p className="font-display text-lg text-muted-foreground">
            <span className="tabular-nums">{firstYear}</span>
            <span aria-hidden className="mx-3 inline-block h-px w-10 bg-gradient-to-r from-[var(--grad-from)] to-[var(--grad-to)] align-middle" />
            <span>{t.experience[0]?.period}</span>
          </p>
        )}
      </div>

      <div id="journey-panel" role="tabpanel" aria-labelledby={`journey-tab-${track}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={track}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
          >
            <Timeline entries={entries} rtl={rtl} current={track === "experience" ? t.experience[0]?.period : undefined} />
          </motion.div>
        </AnimatePresence>
      </div>
    </Section>
  );
}
