import { PageHero, StatPill } from "@/components/layout/page-hero";
import { TalksExplorer } from "@/components/pages/talks-explorer";
import { loadPage, pageMetadata, type LocaleParams } from "@/server/page";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: LocaleParams }) {
  const { locale, t } = await loadPage(params);
  return pageMetadata(locale, "/talks", t.menu.items.talks, t.pages.talks.description);
}

export default async function TalksPage({ params }: { params: LocaleParams }) {
  const { locale, t, data } = await loadPage(params);
  const decks = data.talks.reduce((sum, talk) => sum + talk.lectures.length, 0);
  return (
    <>
      <PageHero eyebrow={t.pages.talks.eyebrow} title={t.pages.talks.title} description={t.pages.talks.description}>
        <div className="flex flex-wrap gap-2">
          <StatPill value={data.talks.filter((x) => x.track === "course").length} label={t.talksPage.tabs.course} />
          <StatPill value={data.talks.filter((x) => x.track === "talk").length} label={t.talksPage.tabs.talk} />
          <StatPill value={decks} label="PDF" />
        </div>
      </PageHero>
      <div className="container-page pb-24">
        <TalksExplorer talks={data.talks} locale={locale} t={{ ui: t.ui, talksPage: t.talksPage }} />
      </div>
    </>
  );
}
