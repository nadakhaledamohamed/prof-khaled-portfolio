import { BookOpen, Cpu, Lightbulb, Wrench, type LucideIcon } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ContactLinks } from "@/components/sections/contact";
import { socialLinksFrom } from "@/data/site";
import { loadPage, pageMetadata, type LocaleParams } from "@/server/page";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: LocaleParams }) {
  const { locale, t } = await loadPage(params);
  return pageMetadata(locale, "/consult", t.menu.items.consult, t.pages.consult.description);
}

const typeIcons: { key: "research" | "knowledge" | "technical" | "technology"; icon: LucideIcon }[] = [
  { key: "research", icon: BookOpen },
  { key: "knowledge", icon: Lightbulb },
  { key: "technical", icon: Wrench },
  { key: "technology", icon: Cpu },
];

export default async function ConsultPage({ params }: { params: LocaleParams }) {
  const { locale, t, data } = await loadPage(params);
  return (
    <>
      <PageHero eyebrow={t.pages.consult.eyebrow} title={t.pages.consult.title} description={t.pages.consult.description}>
        <Stagger role="list" className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {typeIcons.map(({ key, icon: Icon }) => (
            <StaggerItem key={key} role="listitem" className="glass flex items-center gap-3 rounded-2xl p-4">
              <span className="neu grid size-10 shrink-0 place-items-center rounded-xl text-primary">
                <Icon className="size-4.5" aria-hidden />
              </span>
              <span className="text-sm font-semibold">{t.consultPage.types[key]}</span>
            </StaggerItem>
          ))}
        </Stagger>
      </PageHero>
      <div className="container-page grid gap-12 pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <Reveal>
          <ContactForm t={t.contact} locale={locale} consult={t.consultPage} />
        </Reveal>
        <div>
          <h2 className="mb-5 font-display text-2xl font-medium">{t.contact.eyebrow}</h2>
          <ContactLinks t={t.contact} socialLinks={socialLinksFrom(data.links)} opensNewTab={t.common.opensNewTab} />
        </div>
      </div>
    </>
  );
}
