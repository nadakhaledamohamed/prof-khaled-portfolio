import { defaultData } from "@/data/site";
import type { Locale } from "@/i18n/config";
import type { GalleryItem, SiteData } from "@/types";
import { ar } from "./ar";
import { en } from "./en";
import type { Dictionary, SiteContent } from "./types";

/** Bundled content: seeds the database on first run and is the fallback if it is unreachable. */
export const defaultContent: SiteContent = { en, ar, data: defaultData };

export function getDictionary(locale: Locale): Dictionary {
  return defaultContent[locale];
}

export function getGallery(data: SiteData, locale: Locale): GalleryItem[] {
  const isAr = locale === "ar";
  return data.gallery.map((entry) => ({
    type: entry.type,
    src: entry.src,
    title: (isAr ? entry.titleAr : entry.titleEn) || entry.titleEn,
    caption: (isAr ? entry.captionAr : entry.captionEn) || entry.captionEn,
  }));
}

export type { Dictionary, SiteContent };
