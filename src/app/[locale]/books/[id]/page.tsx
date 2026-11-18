import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, BookOpenText, FileText } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { PageHero } from "@/components/layout/page-hero";
import { BookCard } from "@/components/sections/books";
import { PdfReader } from "@/components/pages/pdf-reader";
import { Button } from "@/components/ui/button";
import { fmt, href, locales } from "@/i18n/config";
import { isUpload } from "@/data/site";
import { arrowNudge, cn, flipRtl } from "@/lib/utils";
import { getSiteContent } from "@/server/content";
import { loadPage, pageMetadata } from "@/server/page";

export const revalidate = 300;
export const dynamicParams = true;

type Params = Promise<{ locale: string; id: string }>;

export async function generateStaticParams() {
  const { data } = await getSiteContent();
  return locales.flatMap((locale) => data.books.map((b) => ({ locale, id: b.id })));
}

async function load(params: Params) {
  const { id } = await params;
  const page = await loadPage(params);
  const book = page.data.books.find((b) => b.id === id);
  if (!book) notFound();
  return { ...page, book };
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, book } = await load(params);
  const title = locale === "ar" && book.titleAr ? book.titleAr : book.title;
  const summary = (locale === "ar" ? book.summaryAr || book.summaryEn : book.summaryEn || book.summaryAr) || undefined;
  return pageMetadata(locale, `/books/${book.id}`, title, summary, book.cover);
}

export default async function BookPage({ params }: { params: Params }) {
  const { locale, t, data, book } = await load(params);
  const isAr = locale === "ar";
  const title = isAr && book.titleAr ? book.titleAr : book.title;
  const other = isAr ? (book.titleAr ? book.title : null) : book.titleAr;
  const summary = isAr ? book.summaryAr || book.summaryEn : book.summaryEn || book.summaryAr;
  const authors = isAr ? book.authorsAr || book.authorsEn : book.authorsEn || book.authorsAr;
  const related = data.books.filter((b) => b.id !== book.id).slice(0, 5);

  const facts = [
    { label: t.booksPage.authors, value: authors },
    { label: t.booksPage.publisher, value: isAr ? book.publisherAr : book.publisher },
    { label: t.booksPage.year, value: book.year ? String(book.year) : "" },
    { label: t.booksPage.isbn, value: book.isbn },
    { label: t.booksPage.citations, value: book.citations ? String(book.citations) : "" },
  ].filter((f) => f.value);

  return (
    <>
      <PageHero
        compact
        eyebrow={t.pages.books.eyebrow}
        title={title}
        back={{ href: href(locale, "/books"), label: t.booksPage.backToBooks }}
      />

      <div className="container-page grid gap-10 pb-16 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
        <Reveal className="mx-auto w-full max-w-xs lg:mx-0">
          <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-border shadow-[0_30px_60px_-25px_rgb(0_0_0/0.5)]">
            {book.cover && (
              <Image src={book.cover} alt={fmt(t.books.coverAlt, { title })} fill priority sizes="320px" unoptimized={isUpload(book.cover)} className="object-cover" />
            )}
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          {other && (
            <p lang={isAr ? "en" : "ar"} className="mb-6 font-display text-xl text-muted-foreground">
              <bdi>{other}</bdi>
            </p>
          )}
          <dl className="glass divide-y divide-border rounded-3xl">
            {facts.map((fact) => (
              <div key={fact.label} className="grid gap-1 px-5 py-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
                <dt className="text-sm text-muted-foreground">{fact.label}</dt>
                <dd className="font-medium">
                  <bdi>{fact.value}</bdi>
                </dd>
              </div>
            ))}
          </dl>
          {summary && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{summary}</p>}

          <div className="mt-8 flex flex-wrap gap-3">
            {book.ebook && (
              <Button asChild variant="brand" size="lg">
                <Link href={href(locale, `/books/${book.id}/read`)}>
                  <BookOpenText /> {t.booksPage.readOnline}
                </Link>
              </Button>
            )}
            {book.pdf && (
              <Button asChild variant={book.ebook ? "outline" : "brand"} size="lg">
                <a href="#reader">
                  <FileText /> {t.booksPage.readOnline}
                </a>
              </Button>
            )}
            {book.url && (
              <Button asChild variant="outline" size="lg">
                <a href={book.url} target="_blank" rel="noopener noreferrer">
                  {t.ui.externalSource} <ArrowUpRight className={cn(arrowNudge, flipRtl)} />
                </a>
              </Button>
            )}
          </div>
        </Reveal>
      </div>

      {book.pdf && (
        <section id="reader" className="container-page scroll-mt-24 pb-16" aria-label={t.booksPage.readOnline}>
          <PdfReader
            pdf={book.pdf}
            toc={book.toc}
            offset={book.tocOffset}
            title={title}
            tocLang={book.language}
            labels={{ contents: t.booksPage.contents, openPdf: t.booksPage.openPdf, page: t.booksPage.page }}
          />
        </section>
      )}

      {related.length > 0 && (
        <section className="container-page pb-24" aria-labelledby="related-books">
          <h2 id="related-books" className="mb-8 font-display text-3xl font-medium">
            {t.menu.items.books}
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((b) => (
              <li key={b.id}>
                <BookCard book={b} t={t.books} page={t.booksPage} locale={locale} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
