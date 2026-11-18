import { PageHero, StatPill } from "@/components/layout/page-hero";
import { Publications } from "@/components/sections/publications";
import { fmt } from "@/i18n/config";
import { loadPage, pageMetadata, type LocaleParams } from "@/server/page";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: LocaleParams }) {
  const { locale, t } = await loadPage(params);
  return pageMetadata(locale, "/publications", t.menu.items.publications, t.pages.publications.description);
}

export default async function PublicationsPage({ params }: { params: LocaleParams }) {
  const { locale, t, data } = await loadPage(params);
  const totalCitations = data.publications.reduce((sum, p) => sum + p.citations, 0);
  const citations = data.metrics.find((m) => m.id === "citations")?.value ?? totalCitations;
  const h = data.metrics.find((m) => m.id === "h-index")?.value;

  return (
    <>
      <PageHero eyebrow={t.pages.publications.eyebrow} title={t.pages.publications.title} description={t.pages.publications.description}>
        <div className="flex flex-wrap gap-2">
          <StatPill value={data.publications.length} label={t.nav.publications} />
          <StatPill value={citations} label={t.impact.metrics.citations.label} />
          {h !== undefined && <StatPill value={h} label={t.impact.metrics["h-index"].label} />}
          <StatPill
            value={data.metricsSince.citations}
            label={`${t.impact.metrics.citations.label} · ${fmt(t.ui.since, { year: data.metricsSince.year })}`}
          />
        </div>
      </PageHero>
      <Publications
        bare
        t={t.publications}
        page={t.publicationsPage}
        ui={t.ui}
        locale={locale}
        publications={data.publications}
        scholarUrl={data.links.scholar}
      />
    </>
  );
}
