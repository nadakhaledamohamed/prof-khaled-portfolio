import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Background } from "@/components/effects/background";
import { Cursor } from "@/components/effects/cursor";
import { LoadingScreen } from "@/components/effects/loading-screen";
import { ScrollProgress } from "@/components/effects/scroll-progress";
import { BackToTop } from "@/components/layout/back-to-top";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/providers";
import { siteUrl, socialLinksFrom } from "@/data/site";
import { dirOf, isLocale, localePath, locales } from "@/i18n/config";
import { getSiteContent } from "@/server/content";
import { fontVariables } from "../fonts";
import "../globals.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Params = Promise<{ locale: string }>;

const OG_IMAGE = { url: "/og-image.jpg", width: 1200, height: 630 };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const content = await getSiteContent();
  const t = content[locale];
  const other = content[locale === "en" ? "ar" : "en"];
  const links = content.data.links;

  return {
    metadataBase: new URL(siteUrl),
    title: { default: t.meta.title, template: `%s · ${t.profile.shortName}` },
    description: t.meta.description,
    applicationName: t.profile.fullTitle,
    authors: [{ name: t.profile.name, url: links.scholar }],
    creator: t.profile.name,
    keywords: t.meta.keywords,
    alternates: {
      canonical: localePath(locale),
      languages: { en: localePath("en"), ar: localePath("ar"), "x-default": localePath("en") },
    },
    openGraph: {
      type: "profile",
      url: localePath(locale),
      siteName: t.profile.fullTitle,
      title: t.meta.title,
      description: t.meta.description,
      locale: t.meta.ogLocale,
      alternateLocale: [other.meta.ogLocale],
      images: [{ ...OG_IMAGE, alt: t.meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
      images: [OG_IMAGE.url],
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#070a12" },
  ],
  colorScheme: "light dark",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = await getSiteContent();
  const t = content[locale];
  const links = content.data.links;
  const socialLinks = socialLinksFrom(links);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: t.profile.name,
    alternateName: content[locale === "en" ? "ar" : "en"].profile.name,
    honorificPrefix: locale === "ar" ? "أ.د." : "Prof.",
    jobTitle: t.hero.eyebrow,
    description: t.meta.description,
    url: `${siteUrl}${localePath(locale)}`,
    image: links.photo.startsWith("/") ? `${siteUrl}${links.photo}` : links.photo,
    email: links.email ? `mailto:${links.email}` : undefined,
    affiliation: [
      { "@type": "CollegeOrUniversity", name: "Fayoum University", url: links.fayoum || undefined },
      {
        "@type": "Organization",
        name: "Mohammed bin Rashid Al Maktoum Knowledge Foundation",
        url: links.mbrf || undefined,
      },
    ],
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "University of Pittsburgh" },
      { "@type": "CollegeOrUniversity", name: "Cairo University" },
    ],
    award: t.awards.items.map((a) => `${a.title}${a.year ? ` (${a.year})` : ""}`),
    knowsAbout: t.research.areas.map((area) => area.title),
    sameAs: [links.scholar, links.linkedin, links.facebook].filter(Boolean),
  };

  return (
    <html lang={locale} dir={dirOf(locale)} suppressHydrationWarning className={fontVariables}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers>
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
          <Navbar locale={locale} t={{ common: t.common, profile: t.profile, menu: t.menu }} />
          <main id="main" className="relative z-10">
            {children}
          </main>
          <Footer
            locale={locale}
            t={{ footer: t.footer, profile: t.profile, common: t.common, menu: t.menu, contactLinks: t.contact.links }}
            socialLinks={socialLinks}
          />
          <BackToTop label={t.common.backToTop} />
        </Providers>
      </body>
    </html>
  );
}
