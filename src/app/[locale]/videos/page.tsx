import { PageHero, StatPill } from "@/components/layout/page-hero";
import { VideoGrid } from "@/components/pages/video-grid";
import { loadPage, pageMetadata, type LocaleParams } from "@/server/page";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: LocaleParams }) {
  const { locale, t } = await loadPage(params);
  return pageMetadata(locale, "/videos", t.menu.items.videos, t.pages.videos.description);
}

export default async function VideosPage({ params }: { params: LocaleParams }) {
  const { locale, t, data } = await loadPage(params);
  return (
    <>
      <PageHero eyebrow={t.pages.videos.eyebrow} title={t.pages.videos.title} description={t.pages.videos.description}>
        <StatPill value={data.videos.length} label={t.menu.items.videos} />
      </PageHero>
      <div className="container-page pb-24">
        <VideoGrid videos={data.videos} locale={locale} t={{ ui: t.ui, videosPage: t.videosPage }} />
      </div>
    </>
  );
}
