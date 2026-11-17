import type { Metadata, Viewport } from "next";
import {
  Fraunces,
  Geist_Mono,
  IBM_Plex_Sans_Arabic,
  Inter,
  Noto_Kufi_Arabic,
} from "next/font/google";
import { notFound } from "next/navigation";
import { Providers } from "@/components/providers";
import { getSiteContent } from "@/server/content";
import { siteUrl } from "@/data/site";
import { dirOf, isLocale, localePath, locales } from "@/i18n/config";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
});
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
// Arabic faces: only fetched when Arabic glyphs are on screen (unicode-range), so no preload.
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-ar",
  display: "swap",
  preload: false,
});
const kufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-kufi",
  display: "swap",
  preload: false,
});

const fontVariables = [inter, fraunces, geistMono, plexArabic, kufiArabic]
  .map((font) => font.variable)
  .join(" ");

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const content = await getSiteContent();
  const t = content[locale];
  const other = content[locale === "en" ? "ar" : "en"];
  const links = content.data.links;
  const ogImage = { url: "/api/og", width: 1200, height: 630, alt: t.meta.title };

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
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
      images: [ogImage.url],
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
    affiliation: [
      { "@type": "CollegeOrUniversity", name: "Fayoum University", url: links.fayoum || undefined },
      {
        "@type": "Organization",
        name: "Mohammed Bin Rashid Al Maktoum Knowledge Foundation",
        url: links.mbrf || undefined,
      },
    ],
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "University of Pittsburgh" },
      { "@type": "CollegeOrUniversity", name: "Cairo University" },
    ],
    award: "International Obada Prize in Multidisciplinary Sciences (2022)",
    knowsAbout: t.research.areas.map((area) => area.title),
    sameAs: links.scholar ? [links.scholar] : [],
  };

  return (
    <html lang={locale} dir={dirOf(locale)} suppressHydrationWarning className={fontVariables}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
