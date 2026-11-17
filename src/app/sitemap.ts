import type { MetadataRoute } from "next";
import { siteUrl } from "@/data/site";
import { localePath, locales } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    locales.map((locale) => [locale, `${siteUrl}${localePath(locale)}`]),
  );
  return locales.map((locale) => ({
    url: `${siteUrl}${localePath(locale)}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: locale === "en" ? 1 : 0.9,
    alternates: { languages },
  }));
}
