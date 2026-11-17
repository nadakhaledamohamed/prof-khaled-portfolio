import { notFound } from "next/navigation";
import { Background } from "@/components/effects/background";
import { Cursor } from "@/components/effects/cursor";
import { LoadingScreen } from "@/components/effects/loading-screen";
import { ScrollProgress } from "@/components/effects/scroll-progress";
import { BackToTop } from "@/components/layout/back-to-top";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { About } from "@/components/sections/about";
import { Awards } from "@/components/sections/awards";
import { Books } from "@/components/sections/books";
import { Contact } from "@/components/sections/contact";
import { Gallery } from "@/components/sections/gallery";
import { Hero } from "@/components/sections/hero";
import { Impact } from "@/components/sections/impact";
import { Journey } from "@/components/sections/journey";
import { Marquee } from "@/components/sections/marquee";
import { Network } from "@/components/sections/network";
import { Publications } from "@/components/sections/publications";
import { Research } from "@/components/sections/research";
import { getGallery } from "@/content";
import { computeStats, socialLinksFrom } from "@/data/site";
import { isLocale } from "@/i18n/config";
import { getSiteContent } from "@/server/content";

/** Pages are static and refreshed in the background; admin saves refresh them immediately. */
export const revalidate = 300;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const content = await getSiteContent();
  const t = content[locale];
  const data = content.data;
  const socialLinks = socialLinksFrom(data.links);

  return (
    <>
      <a
        href="#main"
        className="fixed start-4 top-4 z-[300] -translate-y-24 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform focus:translate-y-0"
      >
        {t.common.skipToContent}
      </a>
      <LoadingScreen label={t.common.loading} tagline={t.profile.tagline} />
      <Background />
      <Cursor />
      <ScrollProgress />
      <Navbar
        locale={locale}
        t={{ common: t.common, nav: t.nav, profile: t.profile }}
        links={data.links}
      />

      <main id="main" className="relative z-10">
        <Hero t={t.hero} profile={t.profile} common={t.common} data={data} />
        <Marquee t={t.marquee} />
        <About t={t.about} />
        <Impact
          t={t.impact}
          categories={t.publications.categories}
          locale={locale}
          metrics={data.metrics}
          stats={computeStats(data.publications)}
        />
        <Journey t={t.journey} locale={locale} />
        <Research t={t.research} />
        <Books t={t.books} locale={locale} books={data.books} />
        <Publications
          t={t.publications}
          publications={data.publications}
          scholarUrl={data.links.scholar}
        />
        <Awards t={t.awards} />
        {data.gallery.length > 0 && (
          <Gallery
            t={t.gallery}
            opensNewTab={t.common.opensNewTab}
            items={getGallery(data, locale)}
            locale={locale}
          />
        )}
        <Network t={t.network} locale={locale} collaborators={data.collaborators} />
        <Contact
          t={t.contact}
          opensNewTab={t.common.opensNewTab}
          locale={locale}
          socialLinks={socialLinks}
        />
      </main>

      <Footer
        t={{
          footer: t.footer,
          profile: t.profile,
          nav: t.nav,
          common: t.common,
          contactLinks: t.contact.links,
        }}
        socialLinks={socialLinks}
      />
      <BackToTop label={t.common.backToTop} />
    </>
  );
}
