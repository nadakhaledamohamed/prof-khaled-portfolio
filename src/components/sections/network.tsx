"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { Dictionary } from "@/content/types";
import { fmt, type Locale } from "@/i18n/config";
import { cn, easeOutExpo, flipRtl, initials } from "@/lib/utils";
import type { Collaborator, Testimonial } from "@/types";

const AUTOPLAY_MS = 7000;

interface CarouselProps {
  t: Dictionary["network"];
  items: Testimonial[];
  placeholder: boolean;
  rtl: boolean;
}

function TestimonialCarousel({ t, items, placeholder, rtl }: CarouselProps) {
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [paused, setPaused] = React.useState(false);
  // "Forward" slides in from the inline end, so the motion follows reading direction.
  const sign = rtl ? -1 : 1;

  const go = React.useCallback(
    (delta: number) => {
      setDirection(delta);
      setIndex((i) => (i + delta + items.length) % items.length);
    },
    [items.length],
  );

  React.useEffect(() => {
    if (paused || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, go, items.length]);

  const item = items[index];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={t.carouselLabel}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="glass relative overflow-hidden rounded-3xl p-7 sm:p-12"
    >
      <Quote
        aria-hidden
        strokeWidth={1}
        className="absolute -end-4 -top-4 size-40 text-primary opacity-[0.07] rtl:-scale-x-100"
      />
      {placeholder && (
        <p className="mb-6 inline-flex rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-accent">
          {t.placeholderBadge}
        </p>
      )}

      <div className="relative min-h-[15rem] sm:min-h-[12rem]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.figure
            key={index}
            initial={{ opacity: 0, x: direction * sign * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * sign * -48 }}
            transition={{ duration: 0.55, ease: easeOutExpo }}
          >
            <blockquote className="font-display text-2xl leading-snug text-balance sm:text-[2rem] sm:leading-[1.25] rtl:leading-relaxed">
              “{item.quote}”
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              <span className="bg-brand grid size-12 shrink-0 place-items-center rounded-full text-sm font-semibold text-white dark:text-[#070a12]">
                {initials(item.name)}
              </span>
              <span>
                <span className="block font-semibold">{item.name}</span>
                <span className="block text-sm text-muted-foreground">{item.role}</span>
              </span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      {items.length > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={fmt(t.showTestimonial, { i: i + 1, n: items.length })}
                aria-current={i === index}
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                }}
                className="group py-3"
              >
                <span
                  className={cn(
                    "block h-1 rounded-full transition-all duration-500",
                    i === index ? "bg-brand w-10" : "w-4 bg-border group-hover:bg-muted-foreground",
                  )}
                />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {[-1, 1].map((delta) => (
              <button
                key={delta}
                type="button"
                aria-label={delta < 0 ? t.prev : t.next}
                onClick={() => go(delta)}
                className="grid size-11 place-items-center rounded-full border border-border transition-[transform,border-color,color] duration-300 hover:scale-105 hover:border-primary/50 hover:text-primary active:scale-90"
              >
                {delta < 0 ? (
                  <ChevronLeft className={cn("size-4", flipRtl)} />
                ) : (
                  <ChevronRight className={cn("size-4", flipRtl)} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Network({
  t,
  locale,
  collaborators,
}: {
  t: Dictionary["network"];
  locale: Locale;
  collaborators: Collaborator[];
}) {
  const hasReal = t.testimonials.length > 0;
  const showPlaceholders = !hasReal && process.env.NODE_ENV === "development";
  const items = hasReal ? t.testimonials : showPlaceholders ? t.placeholders : [];

  return (
    <Section id="network">
      <SectionHeading
        id="network"
        index="09"
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />

      <Stagger role="list" className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        {collaborators.map(({ id, name, affiliationEn, affiliationAr }) => (
          <StaggerItem key={id} role="listitem">
            <SpotlightCard tilt className="h-full p-6 sm:p-7">
              <span
                dir="ltr"
                className="neu grid size-14 place-items-center rounded-full font-display text-lg font-medium text-primary transition-transform duration-500 group-hover/spot:scale-110"
              >
                {initials(name)}
              </span>
              <h3 lang="en" className="mt-6 text-lg font-semibold leading-snug">
                <bdi>{name}</bdi>
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{(locale === "ar" ? affiliationAr : affiliationEn) || affiliationEn}</p>
            </SpotlightCard>
          </StaggerItem>
        ))}
      </Stagger>

      {items.length > 0 && (
        <Reveal className="mt-5">
          <TestimonialCarousel t={t} items={items} placeholder={!hasReal} rtl={locale === "ar"} />
        </Reveal>
      )}
    </Section>
  );
}
