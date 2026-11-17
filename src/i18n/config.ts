export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Cookie that remembers the visitor's last chosen language. */
export const LOCALE_COOKIE = "km-lang";

export function isLocale(value: string | null | undefined): value is Locale {
  return value != null && (locales as readonly string[]).includes(value);
}

export function dirOf(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Public URL path of a locale's home page. English lives at "/", Arabic at "/ar". */
export function localePath(locale: Locale, hash = "") {
  return (locale === defaultLocale ? "/" : `/${locale}`) + hash;
}

/** Replaces {name} placeholders in a dictionary string. */
export function fmt(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}
