"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Award, BadgeCheck, BookOpen, Download } from "lucide-react";
import { Counter } from "@/components/motion/counter";
import { Magnetic } from "@/components/motion/magnetic";
import { Words } from "@/components/motion/reveal";
import { Rich } from "@/components/rich";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/content/types";
import { isUpload } from "@/data/site";
import type { SiteData } from "@/types";
import { useIntroDelay } from "@/hooks/use-intro";
import { arrowNudge, cn, easeOutExpo, flipRtl } from "@/lib/utils";

interface HeroProps {
  t: Dictionary["hero"];
  profile: Dictionary["profile"];
  common: Dictionary["common"];
  data: Pick<SiteData, "links" | "metrics" | "verifiedDomain">;
}

export function Hero({ t, profile, common, data }: HeroProps) {
  const { links, verifiedDomain } = data;
  const ref = React.useRef<HTMLElement>(null);
  const start = useIntroDelay();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 24, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.9, delay: start + delay, ease: easeOutExpo },
  });

  const miniStats = data.metrics.slice(0, 3);

  return (
    <section
      id="top"
      ref={ref}
      aria-label={t.introLabel}
      className="relative flex min-h-[100svh] items-center pb-20 pt-28 sm:pt-36"
    >
      <div className="container-page grid items-center gap-14 lg:grid-cols-[1.25fr_0.75fr] lg:gap-10">
        <motion.div style={{ y: textY, opacity: fade }} className="min-w-0">
          <motion.div {...fadeUp(0)}>
            <Badge variant="glass" className="mb-7 max-w-full py-1.5 pe-4 ps-2">
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <span className="truncate">{t.eyebrow}</span>
            </Badge>
          </motion.div>

          <h1 className="font-display text-[2.75rem] font-medium leading-[0.98] tracking-[-0.03em] sm:text-7xl lg:text-[4.75rem] xl:text-[5.5rem] rtl:leading-[1.3]">
            <Words text={t.nameLine1} delay={start + 0.1} className="block text-balance" />
            <Words text={t.nameLine2} delay={start + 0.34} className="text-gradient block italic" />
          </h1>

          <motion.p
            {...fadeUp(0.55)}
            className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg rtl:leading-loose"
          >
            <Rich text={t.lede} />
          </motion.p>

          <motion.ul {...fadeUp(0.68)} className="mt-7 flex flex-wrap gap-2" aria-label={t.fieldsLabel}>
            {t.tags.map((tag) => (
              <li key={tag}>
                <Badge className="transition-transform duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground">
                  {tag}
                </Badge>
              </li>
            ))}
          </motion.ul>

          <motion.div {...fadeUp(0.8)} className="mt-10 flex flex-wrap items-center gap-3">
            <Magnetic>
              <Button asChild size="lg" variant="brand">
                <a href="#publications">
                  {t.ctaPublications}
                  <ArrowDown className="group-hover/btn:translate-y-0.5" />
                </a>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button asChild size="lg" variant="outline">
                <a href={links.cv} download>
                  <Download className="group-hover/btn:translate-y-0.5" />
                  {common.downloadCv}
                </a>
              </Button>
            </Magnetic>
            <Button asChild variant="ghost" size="lg" className="px-4">
              <a href={links.scholar} target="_blank" rel="noopener noreferrer">
                {common.scholar}
                <ArrowUpRight className={cn(arrowNudge, flipRtl)} />
              </a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Profile card */}
        <motion.div
          style={{ y: cardY }}
          className="relative mx-auto w-full max-w-sm lg:mx-0 lg:justify-self-end"
        >
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: 2, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, rotate: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, delay: start + 0.45, ease: easeOutExpo }}
            className="relative"
          >
            <div aria-hidden className="bg-brand absolute -inset-6 rounded-[3rem] opacity-25 blur-3xl" />
            <div className="glass relative rounded-[2rem] p-6 sm:p-7">
              <div className="flex items-center gap-4">
                <div className="bg-brand relative shrink-0 rounded-3xl p-[2px]">
                  <Image
                    src={links.photo}
                    alt={profile.fullTitle}
                    width={113}
                    height={128}
                    priority
                    unoptimized={isUpload(links.photo)}
                    className="h-[104px] w-[92px] rounded-[1.4rem] object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-xl font-medium leading-tight rtl:leading-snug">
                    {profile.cardName}
                  </p>
                  <p className="mt-1.5 text-sm leading-snug text-muted-foreground">{profile.role}</p>
                </div>
              </div>

              <dl className="mt-6 divide-y divide-border text-sm">
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="shrink-0 text-muted-foreground">{t.cardAffiliation}</dt>
                  <dd className="text-end font-medium">{profile.affiliation}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-muted-foreground">{t.cardField}</dt>
                  <dd className="text-end font-medium">{profile.field}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-muted-foreground">{t.cardVerified}</dt>
                  <dd className="inline-flex items-center gap-1.5 font-medium">
                    <BadgeCheck className="size-4 text-primary" aria-hidden />
                    {verifiedDomain}
                  </dd>
                </div>
              </dl>

              <dl className="neu-inset mt-4 grid grid-cols-3 rounded-2xl py-4 text-center">
                {miniStats.map((metric, i) => (
                  <div key={metric.id} className="flex flex-col-reverse">
                    <dt className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t.miniLabels[i]}
                    </dt>
                    <dd className="font-display text-3xl font-medium">
                      <Counter value={metric.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Floating chips */}
            <div className="animate-float glass absolute -start-3 -top-5 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-medium sm:-start-10">
              <BookOpen className="size-4 text-primary" aria-hidden />
              {t.chipBooks}
            </div>
            <div className="animate-float-slow glass absolute -bottom-5 -end-2 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-medium sm:-end-6">
              <Award className="size-4 text-accent" aria-hidden />
              {t.chipAward}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#about"
        aria-label={t.scrollAria}
        style={{ opacity: fade }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground md:flex"
      >
        {t.scroll}
        <span className="relative h-9 w-px overflow-hidden bg-border">
          <motion.span
            className="absolute inset-x-0 top-0 h-3 bg-primary"
            animate={{ y: [-12, 36] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.a>
    </section>
  );
}
