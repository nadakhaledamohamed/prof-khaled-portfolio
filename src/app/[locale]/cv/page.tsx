import { Download } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { CvView } from "@/components/pages/cv-view";
import { Button } from "@/components/ui/button";
import { loadPage, pageMetadata, type LocaleParams } from "@/server/page";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: LocaleParams }) {
  const { locale, t } = await loadPage(params);
  return pageMetadata(locale, "/cv", t.menu.items.cv, t.pages.cv.description);
}

export default async function CvPage({ params }: { params: LocaleParams }) {
  const { locale, t, data } = await loadPage(params);

  return (
    <>
      <PageHero eyebrow={t.pages.cv.eyebrow} title={t.pages.cv.title} description={t.pages.cv.description}>
        <Button asChild variant="brand" size="lg">
          <a href={data.links.cv} download>
            <Download className="group-hover/btn:translate-y-0.5" /> {t.cvPage.download}
          </a>
        </Button>
      </PageHero>
      <CvView sections={data.cv} locale={locale} indexLabel={t.cvPage.sections} />
    </>
  );
}
