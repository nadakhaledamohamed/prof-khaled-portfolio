"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Expand, FileText, X } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import type { Dictionary } from "@/content/types";
import { isUpload } from "@/data/site";
import { fmt, type Locale } from "@/i18n/config";
import { cn, easeOutExpo, flipRtl } from "@/lib/utils";
import type { GalleryItem } from "@/types";

type Filter = "all" | GalleryItem["type"];
const filterIds: Filter[] = ["all", "image", "pdf"];

interface GalleryProps {
  t: Dictionary["gallery"];
  opensNewTab: string;
  items: GalleryItem[];
  locale: Locale;
  /** Home page: show this many items and a link to the full gallery. */
  limit?: number;
  viewAll?: { href: string; label: string };
  /** Render without the section heading (the gallery page has its own hero). */
  bare?: boolean;
}

export function Gallery({ t, opensNewTab, items: allItems, locale, limit, viewAll, bare }: GalleryProps) {
  const rtl = locale === "ar";
  const [filter, setFilter] = React.useState<Filter>("all");
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  const images = React.useMemo(() => allItems.filter((item) => item.type === "image"), [allItems]);
  const items = allItems.filter((item) => filter === "all" || item.type === filter);
  const shown = limit ? items.slice(0, limit) : items;
  const hasPdf = allItems.some((item) => item.type === "pdf");
  const current = openIndex === null ? null : images[openIndex];
  const isOpen = openIndex !== null;

  const close = React.useCallback(() => {
    setOpenIndex(null);
    triggerRef.current?.focus();
  }, []);

  const [dir, setDir] = React.useState(1);
  const [portal, setPortal] = React.useState(false);
  React.useEffect(() => setPortal(true), []);
  const step = React.useCallback(
    (delta: number) => {
      setDir(delta);
      setOpenIndex((i) => (i === null ? i : (i + delta + images.length) % images.length));
    },
    [images.length],
  );

  React.useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      // Arrow keys follow reading direction: "next" is to the left in Arabic.
      if (event.key === "ArrowRight") step(rtl ? -1 : 1);
      if (event.key === "ArrowLeft") step(rtl ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close, step, rtl]);

  const body = (
    <>
      <Reveal>
        <div role="group" aria-label={t.filterLabel} className={cn("mb-8 flex flex-wrap gap-1.5", !hasPdf && "hidden")}>
          {filterIds.map((id) => {
            const selected = filter === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(id)}
                className={cn(
                  "relative rounded-full border px-4 py-2 text-[13px] font-medium transition-colors duration-300 active:scale-95",
                  selected
                    ? "border-transparent text-background"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="gallery-filter"
                    className="absolute inset-0 rounded-full bg-foreground"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{t.filters[id]}</span>
              </button>
            );
          })}
        </div>

        {/* Masonry: CSS columns keep each image at its natural aspect ratio. */}
        <ul key={filter} className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 xl:columns-5">
            {shown.map((item, i) => (
              <motion.li
                key={item.src}
                className="mb-3 break-inside-avoid sm:mb-4"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -40px 0px" }}
                transition={{ duration: 0.6, delay: (i % 5) * 0.05, ease: easeOutExpo }}
              >
                {item.type === "image" ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      triggerRef.current = event.currentTarget;
                      setOpenIndex(images.indexOf(item));
                    }}
                    aria-label={fmt(t.viewImage, { title: item.title })}
                    className="group relative block w-full overflow-hidden rounded-2xl border border-border bg-muted text-start"
                  >
                    <Image
                      src={item.src}
                      alt=""
                      width={480}
                      height={360}
                      sizes="(min-width: 1280px) 260px, (min-width: 640px) 33vw, 50vw"
                      unoptimized={isUpload(item.src)}
                      className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <span className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/20 to-transparent p-3.5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                      <span className="line-clamp-2 text-xs font-semibold leading-snug text-white">
                        {item.title}
                      </span>
                    </span>
                    <span className="absolute end-2.5 top-2.5 grid size-8 scale-75 place-items-center rounded-full bg-white/90 text-black opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
                      <Expand className="size-3.5" aria-hidden />
                    </span>
                  </button>
                ) : (
                  <a
                    href={item.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass group flex aspect-[4/3] w-full flex-col justify-between rounded-2xl p-4 transition-[translate,border-color] duration-500 hover:-translate-y-1 hover:border-primary/40"
                  >
                    <span className="neu grid size-12 place-items-center rounded-2xl text-primary transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                      <FileText className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold leading-snug">{item.title}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {item.caption} {opensNewTab}
                      </span>
                    </span>
                  </a>
                )}
              </motion.li>
            ))}
        </ul>
        {viewAll && limit && items.length > limit && (
          <div className="mt-8 flex justify-center">
            <Link
              href={viewAll.href}
              className="glass group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
            >
              {viewAll.label} ({items.length})
              <ArrowRight className={cn("size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5", flipRtl)} aria-hidden />
            </Link>
          </div>
        )}
      </Reveal>

      {/* Lightbox */}
      {portal && createPortal(<AnimatePresence>
        {current && openIndex !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={current.title}
            className="fixed inset-0 z-[150] flex flex-col bg-black/90 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
          >
            <div className="flex items-center justify-between p-4 text-white sm:p-6">
              <p className="font-mono text-xs tabular-nums opacity-70">
                {openIndex + 1} / {images.length}
              </p>
              <button
                ref={closeRef}
                type="button"
                aria-label={t.close}
                onClick={close}
                className="grid size-11 place-items-center rounded-full bg-white/10 transition-[background-color,transform] duration-300 hover:rotate-90 hover:bg-white/20"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20">
              <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                <motion.div
                  key={current.src}
                  custom={dir}
                  className="relative h-[70svh] w-full max-w-3xl cursor-grab touch-pan-y active:cursor-grabbing"
                  variants={{
                    enter: (d: number) => ({ opacity: 0, x: d * (rtl ? -80 : 80), scale: 0.96 }),
                    center: { opacity: 1, x: 0, scale: 1 },
                    exit: (d: number) => ({ opacity: 0, x: d * (rtl ? 80 : -80), scale: 0.96 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: easeOutExpo }}
                  drag={images.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={(_, info) => {
                    const swipe = info.offset.x + info.velocity.x * 0.2;
                    if (Math.abs(swipe) < 80) return;
                    // Swiping towards the reading start shows the next image.
                    step(swipe < 0 !== rtl ? 1 : -1);
                  }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <Image
                    src={current.src}
                    alt={current.title}
                    fill
                    sizes="(min-width: 768px) 768px, 100vw"
                    unoptimized={isUpload(current.src)}
                    draggable={false}
                    className="pointer-events-none select-none object-contain drop-shadow-2xl"
                  />
                </motion.div>
              </AnimatePresence>

              {[-1, 1].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  aria-label={delta < 0 ? t.prev : t.next}
                  onClick={(event) => {
                    event.stopPropagation();
                    step(delta);
                  }}
                  className={cn(
                    "absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-[background-color,transform] duration-300 hover:scale-110 hover:bg-white/20",
                    delta < 0 ? "start-3 sm:start-6" : "end-3 sm:end-6",
                  )}
                >
                  {delta < 0 ? (
                    <ChevronLeft className={cn("size-5", flipRtl)} />
                  ) : (
                    <ChevronRight className={cn("size-5", flipRtl)} />
                  )}
                </button>
              ))}
            </div>

            <div className="p-5 text-center text-white sm:p-7">
              <p className="text-sm font-semibold sm:text-base">{current.title}</p>
              <p className="mt-1 text-xs opacity-70 sm:text-sm">{current.caption}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}
    </>
  );

  if (bare) return <div className="container-page pb-24">{body}</div>;

  return (
    <Section id="gallery">
      <SectionHeading id="gallery" index="10" eyebrow={t.eyebrow} title={t.title} description={t.description} />
      {body}
    </Section>
  );
}
