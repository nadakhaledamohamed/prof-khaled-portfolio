import { FileText } from "lucide-react";
import { BodyText } from "@/components/content/body-text";
import { PageHero, StatPill } from "@/components/layout/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { SystemsExplorer } from "@/components/pages/systems-explorer";
import { loadPage, pageMetadata, type LocaleParams } from "@/server/page";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: LocaleParams }) {
  const { locale, t } = await loadPage(params);
  return pageMetadata(locale, "/systems", t.menu.items.systems, t.pages.systems.description);
}

export default async function SystemsPage({ params }: { params: LocaleParams }) {
  const { locale, t, data } = await loadPage(params);
  const isAr = locale === "ar";
  const report = data.systemsReport;

  return (
    <>
      <PageHero eyebrow={t.pages.systems.eyebrow} title={t.pages.systems.title} description={t.pages.systems.description}>
        <div className="flex flex-wrap gap-2">
          <StatPill value={data.systems.length} label={t.menu.items.systems} />
          <StatPill value={Object.keys(t.systemsPage.indicators).length} label={t.systemsPage.indicatorsLabel} />
          <StatPill value={Object.keys(t.systemsPage.cats).length} label={t.systemsPage.categoriesLabel} />
        </div>
      </PageHero>

      <div className="container-page pb-16">
        <SystemsExplorer systems={data.systems} locale={locale} t={{ ui: t.ui, systemsPage: t.systemsPage }} />
      </div>

      {report?.bodyAr && (
        <section className="container-page pb-24" aria-labelledby="systems-report">
          <Reveal>
            <details className="glass group rounded-3xl p-6 sm:p-10 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-start gap-4">
                <span className="bg-brand grid size-12 shrink-0 place-items-center rounded-2xl text-white dark:text-[#070a12]">
                  <FileText className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t.systemsPage.report}</span>
                  <span id="systems-report" className="mt-1 block font-display text-2xl font-medium leading-snug sm:text-3xl">
                    {isAr ? report.titleAr : report.titleEn || report.titleAr}
                  </span>
                  <span className="mt-3 block max-w-3xl text-muted-foreground">{isAr ? report.summaryAr : report.summaryEn || report.summaryAr}</span>
                  <span className="mt-4 inline-block text-sm font-medium text-primary group-open:hidden">{t.ui.readMore} ↓</span>
                </span>
              </summary>
              <div className="mx-auto mt-8 max-w-3xl border-t border-border pt-8">
                {!isAr && <p className="mb-6 text-sm text-muted-foreground">{t.ui.arabicOnly}</p>}
                <BodyText text={report.bodyAr} lang="ar" />
              </div>
            </details>
          </Reveal>
        </section>
      )}
    </>
  );
}
