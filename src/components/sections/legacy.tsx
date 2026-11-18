"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Counter } from "@/components/motion/counter";
import type { Dictionary } from "@/content/types";
import { pagePaths } from "@/data/site";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";
import { href, type Locale } from "@/i18n/config";
import { cn, easeOutExpo } from "@/lib/utils";

interface LegacyProps {
  t: Dictionary["heritage"];
  locale: Locale;
  /** Kept for API compatibility; the editorial layout does not use artwork. */
  banner?: string;
  counts: { works: number; books: number; research: number; articles: number; talks: number; years: number };
}

const viewport = { once: true, margin: "0px 0px -20% 0px" } as const;

/**
 * The legacy statement, set as a quiet editorial signature: one line, light weight,
 * framed by hairlines and whitespace. Only the current page language is shown.
 */
export function Legacy({ t, locale, counts }: LegacyProps) {
  const reduce = useSafeReducedMotion();
  const isAr = locale === "ar";
  const quote = isAr ? t.phrase : t.title || t.translation;

  const stats: { key: keyof LegacyProps["counts"]; to?: string; suffix?: string }[] = [
    { key: "works", suffix: "+" },
    { key: "books", to: `/${pagePaths.books}` },
    { key: "research", to: `/${pagePaths.publications}` },
    { key: "articles", to: `/${pagePaths.articles}` },
    { key: "talks", to: `/${pagePaths.talks}` },
    { key: "years", to: `/${pagePaths.cv}`, suffix: "+" },
  ];

  const rise = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 14 } as const),
    whileInView: { opacity: 1, y: 0 },
    viewport,
    transition: { duration: 1.2, delay, ease: easeOutExpo },
  });

  return (
    <section id="legacy" aria-labelledby="legacy-title" className="relative z-10 scroll-mt-24 py-28 sm:py-36 lg:py-44">
      <div className="container-page">
        <figure className="mx-auto max-w-5xl text-center">
          <motion.p
            {...rise(0)}
            className={cn(
              "mb-12 text-muted-foreground sm:mb-16",
              isAr ? "text-sm" : "font-mono text-[11px] uppercase tracking-[0.35em]",
            )}
          >
            {t.eyebrow}
          </motion.p>

          {/* Hairline that opens from the centre */}
          <motion.span
            aria-hidden
            className="mx-auto mb-12 block h-px w-24 bg-foreground/25 sm:mb-14"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={viewport}
            transition={{ duration: 1.4, ease: easeOutExpo }}
          />

          <motion.blockquote
            initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={viewport}
            transition={{ duration: 1.6, delay: 0.15, ease: easeOutExpo }}
          >
            <h2
              id="legacy-title"
              lang={locale}
              className={cn(
                "text-balance text-foreground lg:whitespace-nowrap",
                isAr
                  ? "font-[family-name:var(--font-amiri)] text-[2rem] font-normal leading-[1.7] sm:text-5xl lg:text-[3.5rem]"
                  : "font-display text-[1.75rem] font-light leading-[1.25] tracking-[-0.015em] sm:text-4xl lg:text-[2.35rem] xl:text-[2.65rem]",
              )}
            >
              {isAr
                ? quote
                : quote.split(/,\s*/).map((part, i, all) => (
                    <React.Fragment key={i}>
                      <span className="whitespace-nowrap">
                        {part}
                        {i < all.length - 1 ? "," : ""}
                      </span>
                      {i < all.length - 1 ? " " : ""}
                    </React.Fragment>
                  ))}
            </h2>
          </motion.blockquote>

          <motion.span
            aria-hidden
            className="mx-auto mt-12 block h-px w-24 bg-foreground/25 sm:mt-14"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={viewport}
            transition={{ duration: 1.4, delay: 0.3, ease: easeOutExpo }}
          />

          <motion.figcaption
            {...rise(0.45)}
            className={cn(
              "mx-auto mt-10 max-w-xl text-base text-muted-foreground text-pretty sm:text-[1.05rem]",
              isAr ? "leading-loose" : "leading-relaxed",
            )}
          >
            {t.text}
          </motion.figcaption>
        </figure>

        {/* The archive in numbers: a quiet ruled index */}
        <motion.div {...rise(0.2)} className="mx-auto mt-24 max-w-5xl sm:mt-32">
          <p className={cn("mb-8 text-center text-muted-foreground", isAr ? "text-sm" : "font-mono text-[11px] uppercase tracking-[0.3em]")}>
            {t.archiveTitle}
          </p>
          <ul className="grid grid-cols-2 border-t border-border sm:grid-cols-3 lg:grid-cols-6">
            {stats.map(({ key, to, suffix }) => {
              const body = (
                <>
                  <span className="block font-display text-3xl font-light tabular-nums text-foreground transition-colors duration-500 group-hover:text-primary sm:text-4xl">
                    <Counter value={counts[key]} suffix={suffix} />
                  </span>
                  <span className="mt-2 block text-xs leading-snug text-muted-foreground">{t.archive[key]}</span>
                </>
              );
              return (
                <li key={key} className="border-b border-border lg:border-b-0 lg:[&:not(:last-child)]:border-e">
                  {to ? (
                    <Link
                      href={href(locale, to)}
                      className="group block h-full px-3 py-7 text-center transition-colors duration-500 hover:bg-foreground/[0.025]"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="h-full px-3 py-7 text-center">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
