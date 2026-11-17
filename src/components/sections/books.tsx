import Image from "next/image";
import { ArrowUpRight, FileText } from "lucide-react";
import type { Book } from "@/types";
import { Section, SectionHeading } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import type { Dictionary } from "@/content/types";
import { isUpload } from "@/data/site";
import { fmt, type Locale } from "@/i18n/config";
import { cn, flipRtl } from "@/lib/utils";

export function Books({ t, locale, books }: { t: Dictionary["books"]; locale: Locale; books: Book[] }) {
  const isAr = locale === "ar";

  return (
    <Section id="books">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.6fr] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            id="books"
            index="05"
            eyebrow={t.eyebrow}
            title={t.title}
            description={t.description}
            className="mb-0 sm:mb-0"
          />
        </div>

        <Stagger
          role="list"
          stagger={0.06}
          className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12"
        >
          {books.map((book) => {
            // Primary title in the page language; the other language underneath when available.
            const primary = isAr && book.titleAr ? book.titleAr : book.title;
            const secondary = isAr ? (book.titleAr ? book.title : null) : book.titleAr;
            const secondaryLang = isAr ? "en" : "ar";
            // Arabic books bind on the right, so their spine shading sits on the right edge.
            const spineRight = book.language === "ar";

            return (
              <StaggerItem key={book.id} role="listitem">
                <article className="group [perspective:1000px]">
                  <div className="relative transition-transform duration-700 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateY(-14deg)_rotateX(4deg)_translateY(-8px)]">
                    <div
                      aria-hidden
                      className="bg-brand absolute inset-3 -z-10 rounded-xl opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-50"
                    />
                    <div className="relative aspect-[523/720] overflow-hidden rounded-xl border border-border bg-muted shadow-[0_18px_40px_-18px_rgb(0_0_0/0.45)]">
                      <Image
                        src={book.cover}
                        alt={fmt(t.coverAlt, { title: primary })}
                        fill
                        sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 45vw"
                        className="object-cover"
                        unoptimized={isUpload(book.cover)}
                      />
                      <span
                        aria-hidden
                        className={cn(
                          "absolute inset-y-0 w-3 from-black/25 to-transparent",
                          spineRight ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r",
                        )}
                      />
                      <span
                        aria-hidden
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
                      />
                      <span className="absolute end-2.5 top-2.5 rounded-full bg-black/65 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
                        {t.languages[book.language]}
                      </span>
                    </div>
                  </div>

                  <h3
                    lang={isAr && !book.titleAr ? "en" : undefined}
                    className="mt-4 text-sm font-semibold leading-snug sm:text-[15px] rtl:leading-relaxed"
                  >
                    <bdi>{primary}</bdi>
                  </h3>
                  {secondary && (
                    <p lang={secondaryLang} className="mt-1 text-sm leading-snug text-muted-foreground">
                      <bdi>{secondary}</bdi>
                    </p>
                  )}
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {isAr ? book.publisherAr : book.publisher}
                    {book.year ? ` · ${book.year}` : ""}
                  </p>
                  {(book.pdf || book.url) && (
                    <a
                      href={(book.pdf || book.url) as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors duration-300 hover:border-primary/50 hover:text-primary"
                    >
                      {book.pdf ? (
                        <FileText className="size-3.5" aria-hidden />
                      ) : (
                        <ArrowUpRight className={cn("size-3.5", flipRtl)} aria-hidden />
                      )}
                      {book.pdf ? t.readPdf : t.viewOnline}
                    </a>
                  )}
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </Section>
  );
}
