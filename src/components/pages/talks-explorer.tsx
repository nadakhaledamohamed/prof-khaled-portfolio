"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, FileText, GraduationCap, MapPin, Presentation, SearchX } from "lucide-react";
import { BodyText } from "@/components/content/body-text";
import { FilterChips, matches, SearchBox } from "@/components/ui/filters";
import type { Dictionary } from "@/content/types";
import { isUpload } from "@/data/site";
import { fmt, type Locale } from "@/i18n/config";
import { cn, easeOutExpo } from "@/lib/utils";
import type { Talk } from "@/types";
import { PdfModal, type PdfDoc } from "./pdf-modal";

type Track = "all" | Talk["track"];

export function TalksExplorer({
  talks,
  locale,
  t,
  limit,
}: {
  talks: Talk[];
  locale: Locale;
  t: Pick<Dictionary, "ui" | "talksPage">;
  /** Home page teaser: show this many, no filters. */
  limit?: number;
}) {
  const isAr = locale === "ar";
  const [track, setTrack] = React.useState<Track>("all");
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState<string | null>(null);
  const [doc, setDoc] = React.useState<PdfDoc | null>(null);
  const closeDoc = React.useCallback(() => setDoc(null), []);

  const pick = (en: string, ar: string) => (isAr ? ar || en : en || ar);
  const items = talks.filter(
    (talk) =>
      (track === "all" || talk.track === track) &&
      matches(query, talk.titleEn, talk.titleAr, talk.summaryEn, talk.summaryAr, talk.eventEn, talk.eventAr, ...talk.lectures.flatMap((l) => [l.titleEn, l.titleAr])),
  );
  const shown = limit ? items.slice(0, limit) : items;

  return (
    <div>
      {!limit && (
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterChips
            options={(["all", "course", "talk"] as Track[]).map((id) => ({
              id,
              label: t.talksPage.tabs[id],
              count: id === "all" ? talks.length : talks.filter((x) => x.track === id).length,
            }))}
            value={track}
            onChange={setTrack}
            label={t.talksPage.tabs.all}
            layoutId="talk-track"
          />
          <SearchBox value={query} onChange={setQuery} label={t.ui.search} placeholder={t.ui.searchPlaceholder} className="lg:w-80" />
        </div>
      )}

      <ul className={cn("grid gap-5", limit ? "sm:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2")}>
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((talk) => {
            const expanded = open === talk.id;
            const hasDetails = talk.lectures.length > 0 || Boolean(talk.outlineAr);
            const Icon = talk.track === "course" ? GraduationCap : Presentation;
            return (
              <motion.li
                key={talk.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, ease: easeOutExpo }}
              >
                <article className="glass group flex h-full flex-col overflow-hidden rounded-3xl transition-[border-color] duration-500 hover:border-primary/40">
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    {talk.image && (
                      <Image
                        src={talk.image}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        unoptimized={isUpload(talk.image)}
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    )}
                    <span className="glass absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                      <Icon className="size-3.5 text-primary" aria-hidden />
                      {talk.track === "course" ? t.talksPage.tabs.course : t.talksPage.tabs.talk}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs text-muted-foreground">{pick(talk.eventEn, talk.eventAr)}</p>
                    <h3 lang={isAr ? "ar" : talk.titleEn ? "en" : "ar"} className="mt-2 font-display text-xl font-medium leading-snug rtl:leading-relaxed">
                      {pick(talk.titleEn, talk.titleAr)}
                    </h3>
                    {(talk.placeEn || talk.placeAr) && (
                      <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5" aria-hidden /> {pick(talk.placeEn, talk.placeAr)}
                      </p>
                    )}
                    <p className={cn("mt-3 text-sm leading-relaxed text-muted-foreground", !expanded && "line-clamp-3")}>
                      {pick(talk.summaryEn, talk.summaryAr)}
                    </p>

                    {hasDetails && (
                      <button
                        type="button"
                        onClick={() => setOpen(expanded ? null : talk.id)}
                        aria-expanded={expanded}
                        className="mt-auto inline-flex items-center gap-1.5 self-start pt-4 text-sm font-medium text-primary"
                      >
                        {talk.lectures.length > 0 ? fmt(t.talksPage.lectures, { n: talk.lectures.length }) : t.talksPage.outline}
                        <ChevronDown className={cn("size-4 transition-transform duration-300", expanded && "rotate-180")} aria-hidden />
                      </button>
                    )}

                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          {talk.lectures.length > 0 && (
                            <ol className="mt-4 grid gap-2">
                              {talk.lectures.map((lecture, i) => (
                                <li key={i}>
                                  <button
                                    type="button"
                                    disabled={!lecture.file}
                                    onClick={() => lecture.file && setDoc({ title: pick(lecture.titleEn, lecture.titleAr), src: lecture.file })}
                                    className="flex w-full items-start gap-3 rounded-2xl border border-border p-3 text-start transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60"
                                  >
                                    <span className="neu grid size-9 shrink-0 place-items-center rounded-xl text-primary">
                                      <FileText className="size-4" aria-hidden />
                                    </span>
                                    <span className="min-w-0">
                                      <span className="block text-sm font-medium leading-snug">{pick(lecture.titleEn, lecture.titleAr)}</span>
                                      <span className="mt-0.5 block text-xs text-muted-foreground">
                                        {lecture.pages ? fmt(t.talksPage.pages, { n: lecture.pages }) : ""} · {t.talksPage.openPdf}
                                      </span>
                                    </span>
                                  </button>
                                </li>
                              ))}
                            </ol>
                          )}
                          {talk.outlineAr && (
                            <div className="mt-4 rounded-2xl bg-foreground/[0.03] p-4">
                              <p className="mb-1 text-xs font-semibold text-muted-foreground">{t.talksPage.outline}</p>
                              <BodyText text={talk.outlineAr} lang="ar" className="text-sm leading-loose" />
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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

      <PdfModal doc={doc} onClose={closeDoc} labels={{ close: t.talksPage.close, download: t.ui.download, open: t.ui.open }} />
    </div>
  );
}
