"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Play, SearchX, X } from "lucide-react";
import { matches, SearchBox } from "@/components/ui/filters";
import type { Dictionary } from "@/content/types";
import { isUpload, youtubeId } from "@/data/site";
import type { Locale } from "@/i18n/config";
import { easeOutExpo } from "@/lib/utils";
import type { Video } from "@/types";

export function VideoGrid({
  videos,
  locale,
  t,
  limit,
}: {
  videos: Video[];
  locale: Locale;
  t: Pick<Dictionary, "ui" | "videosPage">;
  limit?: number;
}) {
  const isAr = locale === "ar";
  const [query, setQuery] = React.useState("");
  const [playing, setPlaying] = React.useState<{ id: string; title: string } | null>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const pick = (en: string, ar: string) => (isAr ? ar || en : en || ar);

  const items = videos.filter((v) => matches(query, v.titleEn, v.titleAr, v.summaryEn, v.summaryAr, v.eventEn, v.eventAr));
  const shown = limit ? items.slice(0, limit) : items;

  React.useEffect(() => {
    if (!playing) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPlaying(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [playing]);

  return (
    <div>
      {!limit && (
        <SearchBox value={query} onChange={setQuery} label={t.ui.search} placeholder={t.ui.searchPlaceholder} className="mb-8 max-w-md" />
      )}
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((video) => {
            const yt = youtubeId(video.link);
            const title = pick(video.titleEn, video.titleAr);
            const thumb = (
              <div className="relative aspect-video overflow-hidden bg-muted">
                {video.image && (
                  <Image
                    src={video.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    unoptimized={isUpload(video.image)}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black shadow-xl transition-transform duration-500 group-hover:scale-110">
                  {yt ? <Play className="ms-1 size-6 fill-current" aria-hidden /> : <ArrowUpRight className="size-6" aria-hidden />}
                </span>
              </div>
            );
            const body = (
              <div className="flex flex-1 flex-col p-5">
                {(video.eventEn || video.eventAr) && <p className="text-xs text-muted-foreground">{pick(video.eventEn, video.eventAr)}</p>}
                <h3 lang={isAr || !video.titleEn ? "ar" : "en"} className="mt-1.5 font-semibold leading-snug transition-colors group-hover:text-primary rtl:leading-relaxed">
                  {title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{pick(video.summaryEn, video.summaryAr)}</p>
              </div>
            );
            return (
              <motion.li
                key={video.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, ease: easeOutExpo }}
              >
                {yt ? (
                  <button
                    type="button"
                    onClick={() => setPlaying({ id: yt, title })}
                    className="glass group flex h-full w-full flex-col overflow-hidden rounded-3xl text-start transition-[translate,border-color] duration-500 hover:-translate-y-1 hover:border-primary/40"
                    aria-label={`${t.videosPage.watch}: ${title}`}
                  >
                    {thumb}
                    {body}
                  </button>
                ) : (
                  <a
                    href={video.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass group flex h-full flex-col overflow-hidden rounded-3xl transition-[translate,border-color] duration-500 hover:-translate-y-1 hover:border-primary/40"
                    aria-label={`${t.videosPage.external}: ${title}`}
                  >
                    {thumb}
                    {body}
                  </a>
                )}
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

      <AnimatePresence>
        {playing && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={playing.title}
            className="fixed inset-0 z-[150] grid place-items-center bg-black/90 p-4 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPlaying(null)}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={() => setPlaying(null)}
              aria-label={t.videosPage.close}
              className="absolute end-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-transform hover:rotate-90 hover:bg-white/20"
            >
              <X className="size-5" />
            </button>
            <motion.div
              className="aspect-video w-full max-w-5xl overflow-hidden rounded-2xl bg-black shadow-2xl"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ ease: easeOutExpo, duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${playing.id}?autoplay=1&rel=0`}
                title={playing.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="size-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
