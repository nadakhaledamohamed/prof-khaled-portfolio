"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Award,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Link2,
  type LucideIcon,
  Presentation,
  Users,
  Wrench,
  FolderKanban,
} from "lucide-react";
import { BodyText } from "@/components/content/body-text";
import type { Locale } from "@/i18n/config";
import { cn, easeOutExpo } from "@/lib/utils";
import type { CvSection } from "@/types";

/** Icon per CV section, matched on the English title so renamed sections still get one. */
function iconFor(title: string): LucideIcon {
  const t = title.toLowerCase();
  if (t.includes("qualif") || t.includes("educat")) return GraduationCap;
  if (t.includes("experience")) return Briefcase;
  if (t.includes("award")) return Award;
  if (t.includes("member") || t.includes("committee")) return Users;
  if (t.includes("project")) return FolderKanban;
  if (t.includes("consult")) return Lightbulb;
  if (t.includes("teach") || t.includes("supervis")) return Presentation;
  if (t.includes("skill")) return Wrench;
  return Link2;
}

/** CV with a sticky section index; the active section follows the scroll position. */
export function CvView({ sections, locale, indexLabel }: { sections: CvSection[]; locale: Locale; indexLabel: string }) {
  const [active, setActive] = React.useState(sections[0]?.id ?? "");
  const isAr = locale === "ar";

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="container-page grid gap-10 pb-24 lg:grid-cols-[17rem_1fr] lg:gap-14">
      <nav aria-label={indexLabel} className="lg:sticky lg:top-28 lg:self-start">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{indexLabel}</p>
        <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:gap-1 lg:overflow-visible lg:px-0">
          {sections.map((s) => {
            const Icon = iconFor(s.titleEn);
            const on = active === s.id;
            return (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  aria-current={on ? "location" : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                    on ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="cv-active"
                      className="glass absolute inset-0 rounded-2xl"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Icon className={cn("relative size-4 shrink-0", on && "text-primary")} aria-hidden />
                  <span className="relative whitespace-nowrap lg:whitespace-normal">{isAr ? s.titleAr : s.titleEn}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="grid gap-6">
        {sections.map((s, i) => {
          const Icon = iconFor(s.titleEn);
          return (
            <motion.section
              key={s.id}
              id={s.id}
              aria-labelledby={`${s.id}-title`}
              className="glass scroll-mt-28 rounded-3xl p-6 sm:p-9"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              transition={{ duration: 0.7, delay: Math.min(i, 2) * 0.05, ease: easeOutExpo }}
            >
              <header className="mb-4 flex items-center gap-4">
                <span className="neu grid size-12 shrink-0 place-items-center rounded-2xl text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h2 id={`${s.id}-title`} className="font-display text-2xl font-medium sm:text-3xl">
                  {isAr ? s.titleAr : s.titleEn}
                </h2>
              </header>
              <BodyText text={isAr ? s.bodyAr : s.bodyEn} lang={locale} className="text-base sm:text-[17px]" />
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
