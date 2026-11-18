import { PageHero, StatPill } from "@/components/layout/page-hero";
import { OpenLibrary } from "@/components/pages/open-library";
import { loadPage, pageMetadata, type LocaleParams } from "@/server/page";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: LocaleParams }) {
  const { locale, t } = await loadPage(params);
  return pageMetadata(locale, "/open-library", t.menu.items.library, t.pages.library.description);
}

export default async function OpenLibraryPage({ params }: { params: LocaleParams }) {
  const { locale, t, data } = await loadPage(params);
  const groups = new Set(data.openLibrary.map((r) => r.groupEn)).size;
  return (
    <>
      <PageHero eyebrow={t.pages.library.eyebrow} title={t.pages.library.title} description={t.pages.library.description}>
        <div className="flex flex-wrap gap-2">
          <StatPill value={data.openLibrary.length} label={t.menu.items.library} />
          <StatPill value={groups} label={t.libraryPage.groups} />
        </div>
      </PageHero>
      <div className="container-page pb-24">
        <OpenLibrary resources={data.openLibrary} locale={locale} t={{ ui: t.ui, libraryPage: t.libraryPage }} />
      </div>
    </>
  );
}
