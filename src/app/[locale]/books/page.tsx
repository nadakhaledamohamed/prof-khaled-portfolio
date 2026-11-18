import { PageHero, StatPill } from "@/components/layout/page-hero";
import { BookLibrary } from "@/components/pages/book-library";
import { loadPage, pageMetadata, type LocaleParams } from "@/server/page";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: LocaleParams }) {
  const { locale, t } = await loadPage(params);
  return pageMetadata(locale, "/books", t.menu.items.books, t.pages.books.description);
}

export default async function BooksPage({ params }: { params: LocaleParams }) {
  const { locale, t, data } = await loadPage(params);
  const readable = data.books.filter((b) => b.ebook || b.pdf).length;

  return (
    <>
      <PageHero eyebrow={t.pages.books.eyebrow} title={t.pages.books.title} description={t.pages.books.description}>
        <div className="flex flex-wrap gap-2">
          <StatPill value={data.books.length} label={t.nav.books} />
          {readable > 0 && <StatPill value={readable} label={t.booksPage.readOnline} />}
        </div>
      </PageHero>
      <div className="container-page pb-24">
        <BookLibrary filters t={t.books} page={t.booksPage} shelf={t.shelf} locale={locale} books={data.books} />
      </div>
    </>
  );
}
