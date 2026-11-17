"use client";

import { LOCALE_COOKIE, localePath, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

interface LanguageSwitchProps {
  locale: Locale;
  /** Section to land on in the other language (keeps the reader's place). */
  activeSection?: string;
  label: string;
  short: string;
  className?: string;
}

/** Links to the same section in the other language and remembers the choice. */
export function LanguageSwitch({ locale, activeSection, label, short, className }: LanguageSwitchProps) {
  const target: Locale = locale === "en" ? "ar" : "en";
  const hash = activeSection && activeSection !== "top" ? `#${activeSection}` : "";

  return (
    <a
      href={localePath(target, hash)}
      hrefLang={target}
      lang={target}
      aria-label={label}
      title={label}
      onClick={() => {
        document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`;
      }}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full border border-border bg-background/50 text-[13px] font-semibold transition-[transform,border-color,color] duration-300 hover:border-primary/50 hover:text-primary active:scale-90",
        target === "ar" && "font-[family-name:var(--font-plex-ar)] text-base",
        className,
      )}
    >
      {short}
    </a>
  );
}
