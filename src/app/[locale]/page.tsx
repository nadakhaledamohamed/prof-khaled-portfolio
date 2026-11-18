import { About } from "@/components/sections/about";
import { Awards } from "@/components/sections/awards";
import { Books } from "@/components/sections/books";
import { Contact } from "@/components/sections/contact";
import { Gallery } from "@/components/sections/gallery";
import { Hero } from "@/components/sections/hero";
import { ConsultCta, Heritage, LatestArticles, LibraryTeaser, TalksTeaser } from "@/components/sections/home-teasers";
import { Impact } from "@/components/sections/impact";
import { Journey } from "@/components/sections/journey";
import { Marquee } from "@/components/sections/marquee";
import { Network } from "@/components/sections/network";
import { Publications } from "@/components/sections/publications";
import { Research } from "@/components/sections/research";
import { getGallery } from "@/content";
import { computeStats, pagePaths, socialLinksFrom } from "@/data/site";
import { href } from "@/i18n/config";
import { loadPage, type LocaleParams } from "@/server/page";

/** Pages are static and refreshed in the background; admin saves refresh them immediately. */
export const revalidate = 300;

export default async function HomePage({ params }: { params: LocaleParams }) {
  const { locale, t, data } = await loadPage(params);
  const gallery = getGallery(data, locale);

  return (
    <>
      <Hero t={t.hero} profile={t.profile} common={t.common} data={data} />
      <Marquee t={t.marquee} />
      <About t={t.about} />
      <Heritage t={t.heritage} banner={data.links.banner} />
      <Impact
        t={t.impact}
        categories={t.publications.categories}
        locale={locale}
        metrics={data.metrics}
        since={data.metricsSince}
        ui={t.ui}
        stats={computeStats(data.publications)}
      />
      <Journey t={t.journey} locale={locale} />
      <Research t={t.research} />
      <Books t={t.books} page={t.booksPage} ui={t.ui} locale={locale} books={data.books} />
      <Publications
        t={t.publications}
        page={t.publicationsPage}
        ui={t.ui}
        locale={locale}
        publications={data.publications}
        scholarUrl={data.links.scholar}
        limit={8}
      />
      <LatestArticles t={t} locale={locale} articles={data.articles} />
      <TalksTeaser t={t} locale={locale} data={data} />
      <LibraryTeaser t={t} locale={locale} data={data} />
      <Awards t={t.awards} />
      {gallery.length > 0 && (
        <Gallery
          t={t.gallery}
          opensNewTab={t.common.opensNewTab}
          items={gallery}
          locale={locale}
          limit={10}
          viewAll={{ href: href(locale, `/${pagePaths.gallery}`), label: t.ui.viewAll }}
        />
      )}
      <Network t={t.network} locale={locale} collaborators={data.collaborators} />
      <ConsultCta t={t} locale={locale} />
      <Contact t={t.contact} opensNewTab={t.common.opensNewTab} locale={locale} socialLinks={socialLinksFrom(data.links)} />
    </>
  );
}
