import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { socialIcons } from "@/components/icons/social";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import type { Dictionary } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { arrowNudgeGroup, cn, flipRtl } from "@/lib/utils";
import type { SocialLink } from "@/types";

interface ContactProps {
  t: Dictionary["contact"];
  opensNewTab: string;
  locale: Locale;
  socialLinks: SocialLink[];
}

/** Contact section: profile links on one side, the message form on the other. */
export function Contact({ t, opensNewTab, locale, socialLinks }: ContactProps) {
  return (
    <Section id="contact" className="pb-24 sm:pb-32">
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div>
          <SectionHeading id="contact" index="12" eyebrow={t.eyebrow} title={t.title} description={t.description} className="mb-10 sm:mb-10" />
          <ContactLinks t={t} socialLinks={socialLinks} opensNewTab={opensNewTab} />
        </div>
        <Reveal delay={0.1}>
          <ContactForm t={t} locale={locale} />
        </Reveal>
      </div>
    </Section>
  );
}

export function ContactLinks({ t, socialLinks, opensNewTab }: { t: Dictionary["contact"]; socialLinks: SocialLink[]; opensNewTab: string }) {
  return (
    <Stagger role="list" className="grid gap-3">
      {socialLinks.map((link) => {
        const Icon = socialIcons[link.icon];
        const copy = t.links[link.icon];
        const external = !link.url.startsWith("mailto:");
        return (
          <StaggerItem key={link.url} role="listitem">
            <a
              href={link.url}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="glass group flex items-center gap-4 rounded-2xl p-4 transition-[translate,border-color] duration-500 hover:border-primary/40 ltr:hover:translate-x-1.5 rtl:hover:-translate-x-1.5"
            >
              <span className="neu grid size-12 shrink-0 place-items-center rounded-2xl text-primary transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{copy.title}</span>
                <span className="block truncate text-sm text-muted-foreground" dir="auto">
                  {copy.subtitle}
                </span>
              </span>
              <ArrowUpRight
                aria-hidden
                className={cn("size-5 shrink-0 text-muted-foreground transition-[transform,color] duration-300 group-hover:text-primary", arrowNudgeGroup, flipRtl)}
              />
              {external && <span className="sr-only">{opensNewTab}</span>}
            </a>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
