import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenText, FileText } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/content/types";
import { isUpload } from "@/data/site";
import { fmt, href, type Locale } from "@/i18n/config";
import { arrowNudge, cn, flipRtl } from "@/lib/utils";
import type { Book } from "@/types";

interface BooksProps {
  t: Dictionary["books"];
  page: Dictionary["booksPage"];
  ui: Dictionary["ui"];
  locale: Locale;
  books: Book[];
  /** Render only the grid (the /books page has its own hero). */
  bare?: boolean;
}

export function BookCard({ book, t, page, locale }: { book: Book; t: Dictionary["books"]; page: Dictionary["booksPage"]; locale: Locale }) {
  const isAr = locale === "ar";
  const primary = isAr && book.titleAr ? book.titleAr : book.title;
  const secondary = isAr ? (book.titleAr ? book.title : null) : book.titleAr;
  const secondaryLang = isAr ? "en" : "ar";
  // Arabic books bind on the right, so their spine shading sits on the right edge.
  const spineRight = book.language === "ar";
  const readable = Boolean(book.ebook || book.pdf);

  return (
    <article className="group relative [perspective:1000px]">
      <Link href={href(locale, `/books/${book.id}`)} className="absolute inset-0 z-10 rounded-xl" aria-label={primary} />
      <div className="relative transition-transform duration-700 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateY(-14deg)_rotateX(4deg)_translateY(-8px)]">
        <div aria-hidden className="bg-brand absolute inset-3 -z-10 rounded-xl opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-50" />
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border bg-muted shadow-[0_18px_40px_-18px_rgb(0_0_0/0.45)]">
          {book.cover && (
            <Image
              src={book.cover}
              alt={fmt(t.coverAlt, { title: primary })}
              fill
              sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 45vw"
              unoptimized={isUpload(book.cover)}
              className="object-cover"
            />
          )}
          <span aria-hidden className={cn("absolute inset-y-0 w-3 from-black/25 to-transparent", spineRight ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r")} />
          <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
          <span className="absolute end-2.5 top-2.5 rounded-full bg-black/65 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
            {t.languages[book.language]}
          </span>
          {readable && (
            <span className="bg-brand absolute bottom-2.5 start-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg dark:text-[#070a12]">
              {book.ebook ? <BookOpenText className="size-3.5" aria-hidden /> : <FileText className="size-3.5" aria-hidden />}
              {book.ebook ? page.ebookBadge : page.pdfBadge}
            </span>
          )}
        </div>
      </div>

      <h3 lang={isAr && !book.titleAr ? "en" : undefined} className="mt-4 text-sm font-semibold leading-snug transition-colors group-hover:text-primary sm:text-[15px] rtl:leading-relaxed">
        <bdi>{primary}</bdi>
      </h3>
      {secondary && (
        <p lang={secondaryLang} className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
          <bdi>{secondary}</bdi>
        </p>
      )}
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {isAr ? book.publisherAr : book.publisher}
        {book.year ? ` · ${book.year}` : ""}
      </p>
    </article>
  );
}

export function Books({ t, page, ui, locale, books, bare }: BooksProps) {
  const grid = (
    <Stagger role="list" stagger={0.06} className={cn("grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12", bare && "lg:grid-cols-4 xl:grid-cols-5")}>
      {books.map((book) => (
        <StaggerItem key={book.id} role="listitem">
          <BookCard book={book} t={t} page={page} locale={locale} />
        </StaggerItem>
      ))}
    </Stagger>
  );

  if (bare) return <div className="container-page pb-24">{grid}</div>;

  return (
    <Section id="books">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.6fr] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading id="books" index="05" eyebrow={t.eyebrow} title={t.title} description={t.description} className="mb-8 sm:mb-8" />
          <Button asChild variant="outline">
            <Link href={href(locale, "/books")}>
              {ui.viewAll} <ArrowRight className={cn(arrowNudge, flipRtl)} />
            </Link>
          </Button>
        </div>
        {grid}
      </div>
    </Section>
  );
}
