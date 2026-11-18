import { PageHero, StatPill } from "@/components/layout/page-hero";
import { Gallery } from "@/components/sections/gallery";
import { getGallery } from "@/content";
import { loadPage, pageMetadata, type LocaleParams } from "@/server/page";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: LocaleParams }) {
  const { locale, t } = await loadPage(params);
  return pageMetadata(locale, "/gallery", t.menu.items.gallery, t.pages.gallery.description);
}

export default async function GalleryPage({ params }: { params: LocaleParams }) {
  const { locale, t, data } = await loadPage(params);
  const items = getGallery(data, locale);
  return (
    <>
      <PageHero eyebrow={t.pages.gallery.eyebrow} title={t.pages.gallery.title} description={t.pages.gallery.description}>
        <StatPill value={items.filter((i) => i.type === "image").length} label={t.gallery.filters.image} />
      </PageHero>
      <Gallery bare t={t.gallery} opensNewTab={t.common.opensNewTab} items={items} locale={locale} />
    </>
  );
}
