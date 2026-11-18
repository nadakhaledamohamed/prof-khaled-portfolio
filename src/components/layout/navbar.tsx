"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  FileText,
  FolderOpen,
  Images,
  Library,
  Menu,
  MessagesSquare,
  Newspaper,
  PlaySquare,
  Presentation,
  ScrollText,
  Server,
  X,
  type LucideIcon,
} from "lucide-react";
import { LanguageSwitch } from "@/components/layout/language-switch";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/content/types";
import { monogram, pagePaths, sectionIds } from "@/data/site";
import { useActiveSection } from "@/hooks/use-active-section";
import { useIntroDelay } from "@/hooks/use-intro";
import { fmt, href, stripLocale, type Locale } from "@/i18n/config";
import { cn, easeOutExpo } from "@/lib/utils";
import type { PageId } from "@/types";

const pageIcons: Record<PageId, LucideIcon> = {
  cv: ScrollText,
  publications: FileText,
  books: BookOpen,
  articles: Newspaper,
  talks: Presentation,
  videos: PlaySquare,
  systems: Server,
  library: Library,
  gallery: Images,
  consult: MessagesSquare,
};

const NO_SECTIONS: readonly string[] = [];

const groups: { key: "work" | "media" | "resources"; pages: PageId[] }[] = [
  { key: "work", pages: ["publications", "books", "articles"] },
  { key: "media", pages: ["talks", "videos", "gallery"] },
  { key: "resources", pages: ["systems", "library"] },
];

interface NavbarProps {
  locale: Locale;
  t: Pick<Dictionary, "common" | "profile" | "menu">;
}

export function Navbar({ locale, t }: NavbarProps) {
  const pathname = stripLocale(usePathname() ?? "/");
  const isHome = pathname === "/";
  const active = useActiveSection(isHome ? sectionIds : NO_SECTIONS);
  const intro = useIntroDelay();
  const [open, setOpen] = React.useState(false);
  const [menu, setMenu] = React.useState<string | null>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const rtl = locale === "ar";
  const origin = rtl ? "2.5rem 2.5rem" : "calc(100% - 2.5rem) 2.5rem";
  const navRef = React.useRef<HTMLElement>(null);

  const pageHref = (id: PageId) => href(locale, `/${pagePaths[id]}`);
  const isActivePage = (id: PageId) =>
    pathname === `/${pagePaths[id]}` || pathname.startsWith(`/${pagePaths[id]}/`);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation.
  React.useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [pathname]);

  // Close dropdowns on outside click or Escape.
  React.useEffect(() => {
    if (!menu) return;
    const onDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setMenu(null);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenu(null);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

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

  React.useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => desktop.matches && setOpen(false);
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  const linkClass = (activeNow: boolean) =>
    cn(
      "relative flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-medium transition-colors duration-300",
      activeNow ? "text-foreground" : "text-muted-foreground hover:text-foreground",
    );

  const pill = (
    <motion.span
      layoutId="nav-active"
      className="absolute inset-0 rounded-full bg-foreground/[0.07] dark:bg-white/10"
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
    />
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[70] px-3 pt-3 sm:px-5 sm:pt-4">
        <motion.nav
          ref={navRef}
          aria-label={t.common.primaryNav}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: intro - 0.05, ease: easeOutExpo }}
          className={cn(
            "mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-full px-2 transition-[background-color,box-shadow,border-color] duration-500 sm:h-16 sm:px-3",
            scrolled || open || menu ? "glass" : "border border-transparent",
          )}
        >
          <Link
            href={href(locale, "/")}
            aria-label={fmt(t.common.homeAria, { name: t.profile.fullTitle })}
            className="group flex min-w-0 items-center gap-3 rounded-full pe-2"
          >
            <span className="bg-brand grid size-10 shrink-0 place-items-center rounded-full font-display text-[15px] font-semibold text-white transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-105 dark:text-[#070a12]">
              {monogram}
            </span>
            <span className="hidden min-w-0 leading-tight sm:block lg:hidden 2xl:block">
              <span className="block truncate text-sm font-semibold">{t.profile.shortName}</span>
              <span className="block truncate text-[11px] text-muted-foreground">{t.profile.tagline}</span>
            </span>
          </Link>

          <ul className="hidden items-center lg:flex">
            <li>
              <Link
                href={href(locale, "/#about")}
                className={linkClass(isHome && active === "about")}
                aria-current={isHome && active === "about" ? "location" : undefined}
              >
                {isHome && active === "about" && pill}
                <span className="relative">{t.menu.about}</span>
              </Link>
            </li>
            <li>
              <Link href={pageHref("cv")} className={linkClass(isActivePage("cv"))} aria-current={isActivePage("cv") ? "page" : undefined}>
                {isActivePage("cv") && pill}
                <span className="relative">{t.menu.items.cv}</span>
              </Link>
            </li>
            {groups.map((group) => {
              const groupActive = group.pages.some(isActivePage);
              const expanded = menu === group.key;
              return (
                <li key={group.key} className="relative">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`menu-${group.key}`}
                    onClick={() => setMenu(expanded ? null : group.key)}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setMenu(group.key)}
                    className={linkClass(groupActive)}
                  >
                    {groupActive && pill}
                    <span className="relative">{t.menu[group.key]}</span>
                    <ChevronDown className={cn("relative size-3.5 transition-transform duration-300", expanded && "rotate-180")} aria-hidden />
                  </button>
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        id={`menu-${group.key}`}
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        onPointerLeave={(e) => e.pointerType === "mouse" && setMenu(null)}
                        className="glass absolute start-1/2 top-full z-10 mt-3 w-80 -translate-x-1/2 rounded-3xl p-2 shadow-2xl rtl:translate-x-1/2"
                      >
                        <ul>
                          {group.pages.map((id) => {
                            const Icon = pageIcons[id];
                            return (
                              <li key={id}>
                                <Link
                                  href={pageHref(id)}
                                  aria-current={isActivePage(id) ? "page" : undefined}
                                  className={cn(
                                    "group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-foreground/[0.05]",
                                    isActivePage(id) && "bg-foreground/[0.05]",
                                  )}
                                >
                                  <span className="neu grid size-10 shrink-0 place-items-center rounded-xl text-primary transition-transform duration-300 group-hover:scale-110">
                                    <Icon className="size-4.5" aria-hidden />
                                  </span>
                                  <span>
                                    <span className="block text-sm font-semibold">{t.menu.items[id]}</span>
                                    <span className="block text-xs leading-snug text-muted-foreground">{t.menu.hints[id]}</span>
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>

          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitch
              locale={locale}
              activeSection={isHome ? active : undefined}
              label={t.common.switchLanguage.label}
              short={t.common.switchLanguage.short}
            />
            <ThemeToggle labels={{ toDark: t.common.themeToDark, toLight: t.common.themeToLight }} />
            <Button asChild size="sm" variant="brand" className="hidden sm:inline-flex">
              <Link href={pageHref("consult")}>
                <MessagesSquare /> {t.menu.consult}
              </Link>
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
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-background/95 px-5 pb-10 pt-24 backdrop-blur-2xl lg:hidden"
            initial={{ opacity: 0, clipPath: `circle(0% at ${origin})` }}
            animate={{ opacity: 1, clipPath: `circle(150% at ${origin})` }}
            exit={{ opacity: 0, clipPath: `circle(0% at ${origin})` }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
          >
            <div className="grid gap-2">
              <MobileLink href={href(locale, "/")} label={t.menu.home} active={isHome} delay={0.1} />
              <MobileLink href={pageHref("cv")} label={t.menu.items.cv} active={isActivePage("cv")} icon={ScrollText} delay={0.14} />
            </div>
            {groups.map((group, gi) => (
              <motion.section
                key={group.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + gi * 0.06, duration: 0.5, ease: easeOutExpo }}
                className="mt-6"
              >
                <h2 className="mb-2 px-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {t.menu[group.key]}
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {group.pages.map((id) => (
                    <MobileLink key={id} href={pageHref(id)} label={t.menu.items[id]} hint={t.menu.hints[id]} active={isActivePage(id)} icon={pageIcons[id]} />
                  ))}
                </div>
              </motion.section>
            ))}
            <div className="mt-8">
              <Button asChild variant="brand" size="lg" className="w-full">
                <Link href={pageHref("consult")}>
                  <MessagesSquare /> {t.menu.consult}
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileLink({
  href: to,
  label,
  hint,
  active,
  icon: Icon = FolderOpen,
  delay = 0,
}: {
  href: string;
  label: string;
  hint?: string;
  active: boolean;
  icon?: LucideIcon;
  delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.45 }}>
      <Link
        href={to}
        aria-current={active ? "page" : undefined}
        className={cn(
          "glass flex items-center gap-3 rounded-2xl p-3.5 transition-colors",
          active && "border-primary/40 text-primary",
        )}
      >
        <span className="neu grid size-10 shrink-0 place-items-center rounded-xl text-primary">
          <Icon className="size-4.5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block font-semibold">{label}</span>
          {hint && <span className="block truncate text-xs text-muted-foreground">{hint}</span>}
        </span>
      </Link>
    </motion.div>
  );
}
