import type { MetadataRoute } from "next";
import { pagePaths, siteUrl } from "@/data/site";
import { href, locales } from "@/i18n/config";
import { getSiteContent } from "@/server/content";

export const revalidate = 3600;

/** Every public page in both languages, each listing its translation as an alternate. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await getSiteContent();

  const paths: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    ...Object.values(pagePaths).map((p) => ({ path: `/${p}`, priority: 0.8 })),
    ...data.books.map((b) => ({ path: `/books/${b.id}`, priority: 0.7 })),
    ...data.books.filter((b) => b.ebook).map((b) => ({ path: `/books/${b.id}/read`, priority: 0.6 })),
    ...data.articles.map((a) => ({ path: `/articles/${a.id}`, priority: 0.7 })),
    ...data.publications.filter((p) => p.abstractAr).map((p) => ({ path: `/publications/${p.id}`, priority: 0.6 })),
  ];

  return paths.flatMap(({ path, priority }) => {
    const languages = Object.fromEntries(locales.map((locale) => [locale, `${siteUrl}${href(locale, path)}`]));
    return locales.map((locale) => ({
      url: `${siteUrl}${href(locale, path)}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: locale === "en" ? priority : priority * 0.9,
      alternates: { languages },
    }));
  });
}
