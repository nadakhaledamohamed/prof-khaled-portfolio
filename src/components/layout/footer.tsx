import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { socialIcons } from "@/components/icons/social";
import type { Dictionary } from "@/content/types";
import { monogram, pagePaths } from "@/data/site";
import { href, type Locale } from "@/i18n/config";
import { arrowNudgeGroup, cn, flipRtl } from "@/lib/utils";
import type { PageId, SocialLink } from "@/types";

interface FooterProps {
  locale: Locale;
  t: Pick<Dictionary, "footer" | "profile" | "common" | "menu"> & {
    contactLinks: Dictionary["contact"]["links"];
  };
  socialLinks: SocialLink[];
}

const columns: { key: "work" | "media" | "resources"; pages: PageId[] }[] = [
  { key: "work", pages: ["publications", "books", "articles"] },
  { key: "media", pages: ["talks", "videos", "gallery"] },
  { key: "resources", pages: ["cv", "systems", "library", "consult"] },
];

export function Footer({ locale, t, socialLinks }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-border">
      <div className="container-page py-14">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span className="bg-brand grid size-11 shrink-0 place-items-center rounded-full font-display font-semibold text-white dark:text-[#070a12]">
                {monogram}
              </span>
              <div className="leading-tight">
                <p className="font-semibold">{t.profile.fullTitle}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t.profile.footerRole}</p>
              </div>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label={t.footer.elsewhere}>
              {socialLinks.map((link) => {
                const Icon = socialIcons[link.icon];
                const label = t.contactLinks[link.icon].title;
                const external = !link.url.startsWith("mailto:");
                return (
                  <li key={link.icon}>
                    <a
                      href={link.url}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      aria-label={label}
                      title={label}
                      className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground transition-[transform,color,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <nav aria-label={t.common.footerNav} className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.key}>
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  {t.menu[column.key]}
                </p>
                <ul className="grid gap-2.5 text-sm">
                  {column.pages.map((id) => (
                    <li key={id}>
                      <Link
                        href={href(locale, `/${pagePaths[id]}`)}
                        className="group inline-flex items-center gap-1 text-foreground/80 transition-colors hover:text-primary"
                      >
                        {t.menu.items[id]}
                        <ArrowUpRight
                          aria-hidden
                          className={cn("size-3 opacity-0 transition-[opacity,transform] duration-300 group-hover:opacity-100", arrowNudgeGroup, flipRtl)}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>
            © {year} {t.profile.fullTitle}. {t.footer.rights}
          </p>
          <p>{t.footer.dataSource}</p>
        </div>
      </div>
    </footer>
  );
}
