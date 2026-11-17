"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Download, Menu, X } from "lucide-react";
import { LanguageSwitch } from "@/components/layout/language-switch";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/content/types";
import { monogram, navIds, sectionIds } from "@/data/site";
import { useActiveSection } from "@/hooks/use-active-section";
import { useIntroDelay } from "@/hooks/use-intro";
import { fmt, type Locale } from "@/i18n/config";
import { cn, easeOutExpo, flipRtl } from "@/lib/utils";
import type { SiteLinks } from "@/types";

interface NavbarProps {
  locale: Locale;
  t: Pick<Dictionary, "common" | "nav" | "profile">;
  links: SiteLinks;
}

export function Navbar({ locale, t, links }: NavbarProps) {
  const active = useActiveSection(sectionIds);
  const intro = useIntroDelay();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const rtl = locale === "ar";
  const items = navIds.map((id) => ({ id, label: t.nav[id] }));
  // The menu grows out of the menu button, which sits at the inline end of the bar.
  const origin = rtl ? "2.5rem 2.5rem" : "calc(100% - 2.5rem) 2.5rem";

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock scroll and allow Escape to close while the mobile menu is open.
  React.useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close the mobile menu if the viewport grows to desktop size.
  React.useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => desktop.matches && setOpen(false);
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[70] px-3 pt-3 sm:px-5 sm:pt-4">
        <motion.nav
          aria-label={t.common.primaryNav}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: intro - 0.05, ease: easeOutExpo }}
          className={cn(
            "mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-full px-2 transition-[background-color,box-shadow,border-color] duration-500 sm:h-16 sm:px-3",
            scrolled || open ? "glass" : "border border-transparent",
          )}
        >
          <a
            href="#top"
            aria-label={fmt(t.common.homeAria, { name: t.profile.fullTitle })}
            className="group flex min-w-0 items-center gap-3 rounded-full pe-2"
          >
            <span className="bg-brand grid size-10 shrink-0 place-items-center rounded-full font-display text-[15px] font-semibold text-white transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-105 dark:text-[#070a12]">
              {monogram}
            </span>
            <span className="hidden min-w-0 leading-tight sm:block lg:hidden xl:block">
              <span className="block truncate text-sm font-semibold">{t.profile.shortName}</span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {t.profile.tagline}
              </span>
            </span>
          </a>

          <ul className="hidden items-center lg:flex">
            {items.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "relative block rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-300",
                      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-full bg-foreground/[0.07] dark:bg-white/10"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitch
              locale={locale}
              activeSection={active}
              label={t.common.switchLanguage.label}
              short={t.common.switchLanguage.short}
            />
            <ThemeToggle labels={{ toDark: t.common.themeToDark, toLight: t.common.themeToLight }} />
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <a href={links.cv} download>
                <Download className="group-hover/btn:translate-y-0.5" />
                {t.common.cvShort}
              </a>
            </Button>
            <button
              type="button"
              aria-label={open ? t.common.closeMenu : t.common.openMenu}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((value) => !value)}
              className="grid size-10 place-items-center rounded-full border border-border bg-background/50 transition-transform duration-300 active:scale-90 lg:hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {open ? <X className="size-5" /> : <Menu className="size-5" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </motion.nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.common.siteNavigation}
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-background/92 px-6 pb-10 pt-28 backdrop-blur-2xl lg:hidden"
            initial={{ opacity: 0, clipPath: `circle(0% at ${origin})` }}
            animate={{ opacity: 1, clipPath: `circle(150% at ${origin})` }}
            exit={{ opacity: 0, clipPath: `circle(0% at ${origin})` }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
          >
            <ul className="flex flex-col">
              {items.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.05, duration: 0.5, ease: easeOutExpo }}
                  className="border-b border-border"
                >
                  <a
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={active === item.id ? "location" : undefined}
                    className={cn(
                      "flex items-baseline justify-between py-4 font-display text-3xl tracking-tight transition-colors",
                      active === item.id ? "text-primary" : "text-foreground",
                    )}
                  >
                    {item.label}
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="brand">
                <a href={links.cv} download onClick={() => setOpen(false)}>
                  <Download /> {t.common.downloadCv}
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={links.scholar} target="_blank" rel="noopener noreferrer">
                  {t.common.scholar} <ArrowUpRight className={flipRtl} />
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
