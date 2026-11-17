"use client";

import * as React from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Briefcase, GraduationCap, MapPin, type LucideIcon } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import type { Dictionary } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { easeOutExpo } from "@/lib/utils";
import type { TimelineEntry } from "@/types";

interface TimelineProps {
  title: string;
  icon: LucideIcon;
  entries: TimelineEntry[];
  rtl: boolean;
}

/** Vertical timeline whose connecting line draws itself as the list scrolls through the viewport. */
function Timeline({ title, icon: Icon, entries, rtl }: TimelineProps) {
  const ref = React.useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <div>
      <h3 className="mb-8 flex items-center gap-3 font-display text-2xl font-medium">
        <span className="neu grid size-11 place-items-center rounded-2xl text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        {title}
      </h3>

      <ol ref={ref} className="relative">
        <span aria-hidden className="absolute bottom-3 start-[13px] top-3 w-px bg-border" />
        <motion.span
          aria-hidden
          className="bg-brand absolute bottom-3 start-[13px] top-3 w-px origin-top"
          style={{ scaleY }}
        />

        {entries.map((entry, i) => (
          <motion.li
            key={`${entry.period}-${entry.title}`}
            className="group relative pb-6 ps-12 last:pb-0"
            initial={{ opacity: 0, x: rtl ? 24 : -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
            transition={{ duration: 0.8, delay: i * 0.08, ease: easeOutExpo }}
          >
            <motion.span
              aria-hidden
              className="absolute start-0 top-5 grid size-[27px] place-items-center rounded-full border border-border bg-background"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 + i * 0.08 }}
            >
              <span className="bg-brand size-2.5 rounded-full transition-transform duration-500 group-hover:scale-150" />
            </motion.span>

            <div className="glass rounded-2xl p-5 transition-[translate,border-color] duration-500 group-hover:border-primary/30 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 sm:p-6">
              <p className="mb-2 inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider text-primary">
                {entry.period}
              </p>
              <h4 className="text-base font-semibold leading-snug sm:text-lg">{entry.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{entry.organization}</p>
              {entry.location && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" aria-hidden />
                  {entry.location}
                </p>
              )}
              {entry.note && (
                <p className="mt-3 border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">
                  {entry.note}
                </p>
              )}
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

export function Journey({ t, locale }: { t: Dictionary["journey"]; locale: Locale }) {
  const rtl = locale === "ar";
  return (
    <Section id="journey">
      <SectionHeading
        id="journey"
        index="03"
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-12">
        <Timeline title={t.experienceTitle} icon={Briefcase} entries={t.experience} rtl={rtl} />
        <Timeline title={t.educationTitle} icon={GraduationCap} entries={t.education} rtl={rtl} />
      </div>
    </Section>
  );
}
