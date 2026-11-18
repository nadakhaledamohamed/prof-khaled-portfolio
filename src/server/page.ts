import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { href, isLocale, type Locale } from "@/i18n/config";
import { getSiteContent } from "./content";

export type LocaleParams = Promise<{ locale: string }>;

/** Locale, dictionary and data for a public page; 404 for an unknown locale. */
export async function loadPage(params: LocaleParams) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = await getSiteContent();
  return { locale: locale as Locale, t: content[locale], data: content.data };
}

/** Title, description, canonical URL and language alternates for a page at `path`. */
export function pageMetadata(locale: Locale, path: string, title: string, description?: string, image?: string): Metadata {
  const plain = title.replace(/\*/g, "");
  return {
    title: plain,
    description,
    alternates: {
      canonical: href(locale, path),
      languages: { en: href("en", path), ar: href("ar", path), "x-default": href("en", path) },
    },
    openGraph: { title: plain, description, url: href(locale, path), ...(image ? { images: [image] } : {}) },
    twitter: { title: plain, description },
  };
}
