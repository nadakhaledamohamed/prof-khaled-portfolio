import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { EbookReader } from "@/components/pages/ebook-reader";
import { href, locales } from "@/i18n/config";
import { getSiteContent } from "@/server/content";
import { loadPage, pageMetadata } from "@/server/page";

export const revalidate = 300;
export const dynamicParams = true;

type Params = Promise<{ locale: string; id: string }>;

export async function generateStaticParams() {
  const { data } = await getSiteContent();
  return locales.flatMap((locale) => data.books.filter((b) => b.ebook).map((b) => ({ locale, id: b.id })));
}

async function load(params: Params) {
  const { id } = await params;
  const page = await loadPage(params);
  const book = page.data.books.find((b) => b.id === id && b.ebook);
  if (!book) notFound();
  return { ...page, book };
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, t, book } = await load(params);
  const title = locale === "ar" && book.titleAr ? book.titleAr : book.title;
  return pageMetadata(locale, `/books/${book.id}/read`, `${title} · ${t.booksPage.readOnline}`, undefined, book.cover);
}

export default async function ReadPage({ params }: { params: Params }) {
  const { locale, t, book } = await load(params);
  const title = locale === "ar" && book.titleAr ? book.titleAr : book.title;

  return (
    <>
      <PageHero
        compact
        eyebrow={t.booksPage.ebookBadge}
        title={title}
        description={locale === "ar" ? undefined : t.ui.arabicOnly}
        back={{ href: href(locale, `/books/${book.id}`), label: t.ui.back }}
        className="pb-6 sm:pb-8"
      />
      <div className="container-page pb-24">
        <EbookReader
          src={book.ebook!}
          labels={{
            contents: t.booksPage.contents,
            page: t.booksPage.page,
            prev: t.ui.back,
            next: t.ui.readMore,
            search: t.ui.searchPlaceholder,
            noResults: t.ui.noResults,
            loading: t.common.loading,
          }}
        />
      </div>
    </>
  );
}
