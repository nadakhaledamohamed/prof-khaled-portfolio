import { PageHero, StatPill } from "@/components/layout/page-hero";
import { ArticlesExplorer } from "@/components/pages/articles-explorer";
import { loadPage, pageMetadata, type LocaleParams } from "@/server/page";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: LocaleParams }) {
  const { locale, t } = await loadPage(params);
  return pageMetadata(locale, "/articles", t.menu.items.articles, t.pages.articles.description);
}

export default async function ArticlesPage({ params }: { params: LocaleParams }) {
  const { locale, t, data } = await loadPage(params);
  return (
    <>
      <PageHero eyebrow={t.pages.articles.eyebrow} title={t.pages.articles.title} description={t.pages.articles.description}>
        <StatPill value={data.articles.length} label={t.menu.items.articles} />
      </PageHero>
      <ArticlesExplorer articles={data.articles} locale={locale} t={{ ui: t.ui, articlesPage: t.articlesPage }} />
    </>
  );
}
