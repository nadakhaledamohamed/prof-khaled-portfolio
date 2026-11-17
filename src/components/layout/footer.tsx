import { ArrowUpRight } from "lucide-react";
import type { Dictionary } from "@/content/types";
import { monogram, navIds } from "@/data/site";
import type { SocialLink } from "@/types";
import { arrowNudgeGroup, cn, flipRtl } from "@/lib/utils";

interface FooterProps {
  t: Pick<Dictionary, "footer" | "profile" | "nav" | "common"> & {
    contactLinks: Dictionary["contact"]["links"];
  };
  socialLinks: SocialLink[];
}

export function Footer({ t, socialLinks }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-border">
      <div className="container-page py-14">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
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
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-20">
            <nav aria-label={t.common.footerNav}>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                {t.footer.explore}
              </p>
              <ul className="grid gap-2.5 text-sm">
                {navIds.map((id) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="text-foreground/80 underline-offset-4 transition-colors hover:text-primary hover:underline"
                    >
                      {t.nav[id]}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                {t.footer.elsewhere}
              </p>
              <ul className="grid gap-2.5 text-sm">
                {socialLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 text-foreground/80 transition-colors hover:text-primary"
                    >
                      {t.contactLinks[link.icon].title}
                      <ArrowUpRight
                        aria-hidden
                        className={cn(
                          "size-3.5 shrink-0 transition-transform duration-300",
                          arrowNudgeGroup,
                          flipRtl,
                        )}
                      />
                      <span className="sr-only">{t.common.opensNewTab}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
