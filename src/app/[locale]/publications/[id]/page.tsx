import { notFound } from "next/navigation";
import { ArrowUpRight, BookMarked, CalendarDays, Quote } from "lucide-react";
import { BodyText } from "@/components/content/body-text";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { href, locales } from "@/i18n/config";
import { cn, flipRtl } from "@/lib/utils";
import { getSiteContent } from "@/server/content";
import { loadPage, pageMetadata } from "@/server/page";

export const revalidate = 300;
export const dynamicParams = true;

type Params = Promise<{ locale: string; id: string }>;

export async function generateStaticParams() {
  const { data } = await getSiteContent();
  return locales.flatMap((locale) =>
    data.publications.filter((p) => p.abstractAr).map((p) => ({ locale, id: p.id })),
  );
}

async function load(params: Params) {
  const { id } = await params;
  const page = await loadPage(params);
  const pub = page.data.publications.find((p) => p.id === id && p.abstractAr);
  if (!pub) notFound();
  return { ...page, pub };
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, pub } = await load(params);
  const title = locale === "ar" && pub.titleAr ? pub.titleAr : pub.title;
  return pageMetadata(locale, `/publications/${pub.id}`, title, locale === "ar" ? pub.venueAr : pub.venue);
}

export default async function PublicationPage({ params }: { params: Params }) {
  const { locale, t, pub } = await load(params);
  const isAr = locale === "ar";
  const title = isAr && pub.titleAr ? pub.titleAr : pub.title;
  const authors = isAr && pub.authorsAr ? pub.authorsAr : pub.authors;
  const venue = isAr && pub.venueAr ? pub.venueAr : pub.venue;

  return (
    <>
      <PageHero
        compact
        eyebrow={pub.kind === "study" ? t.publicationsPage.kinds.study : t.publicationsPage.kinds.paper}
        title={title}
        description={authors}
        back={{ href: href(locale, "/publications"), label: t.publicationsPage.backToList }}
      >
        <dl className="flex flex-wrap gap-2 text-sm">
          {venue && (
            <div className="glass flex items-center gap-2 rounded-full px-4 py-2">
              <BookMarked className="size-4 text-primary" aria-hidden />
              <dt className="sr-only">{t.publicationsPage.venue}</dt>
              <dd>{venue}</dd>
            </div>
          )}
          {pub.year > 0 && (
            <div className="glass flex items-center gap-2 rounded-full px-4 py-2">
              <CalendarDays className="size-4 text-primary" aria-hidden />
              <dt className="sr-only">{t.booksPage.year}</dt>
              <dd>{pub.year}</dd>
            </div>
          )}
          <div className="glass flex items-center gap-2 rounded-full px-4 py-2">
            <Quote className="size-4 text-primary" aria-hidden />
            <dt className="sr-only">{t.booksPage.citations}</dt>
            <dd>
              {pub.citations} {pub.citations === 1 ? t.publications.citationOne : t.publications.citationMany}
            </dd>
          </div>
        </dl>
        {pub.link && (
          <Button asChild variant="outline" className="mt-5">
            <a href={pub.link} target="_blank" rel="noopener noreferrer">
              {t.ui.externalSource} <ArrowUpRight className={cn(flipRtl)} />
            </a>
          </Button>
        )}
      </PageHero>
      <article className="container-page pb-24">
        <div className="glass mx-auto max-w-3xl rounded-3xl p-6 sm:p-10">
          {!isAr && <p className="mb-6 text-sm text-muted-foreground">{t.ui.arabicOnly}</p>}
          <BodyText text={pub.abstractAr} lang="ar" figureLabel={t.articlesPage.figure} />
        </div>
      </article>
    </>
  );
}
