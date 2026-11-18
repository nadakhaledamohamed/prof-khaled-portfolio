import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight, CalendarDays, Landmark } from "lucide-react";
import { BodyText } from "@/components/content/body-text";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { ArticleCard, formatDate } from "@/components/pages/article-card";
import { Button } from "@/components/ui/button";
import { isUpload } from "@/data/site";
import { href, locales } from "@/i18n/config";
import { cn, flipRtl } from "@/lib/utils";
import { getSiteContent } from "@/server/content";
import { loadPage, pageMetadata } from "@/server/page";

export const revalidate = 300;
export const dynamicParams = true;

type Params = Promise<{ locale: string; id: string }>;

export async function generateStaticParams() {
  const { data } = await getSiteContent();
  return locales.flatMap((locale) => data.articles.map((a) => ({ locale, id: a.id })));
}

async function load(params: Params) {
  const { id } = await params;
  const page = await loadPage(params);
  const article = page.data.articles.find((a) => a.id === id);
  if (!article) notFound();
  return { ...page, article };
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, article } = await load(params);
  const isAr = locale === "ar";
  return pageMetadata(
    locale,
    `/articles/${article.id}`,
    isAr ? article.titleAr : article.titleEn || article.titleAr,
    isAr ? article.summaryAr : article.summaryEn || article.summaryAr,
    article.image ?? undefined,
  );
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { locale, t, data, article } = await load(params);
  const isAr = locale === "ar";
  const title = isAr ? article.titleAr : article.titleEn || article.titleAr;
  const venue = isAr ? article.venueAr : article.venueEn;
  const others = data.articles.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <>
      <PageHero
        compact
        eyebrow={t.pages.articles.eyebrow}
        title={title}
        description={isAr ? article.summaryAr : article.summaryEn}
        back={{ href: href(locale, "/articles"), label: t.articlesPage.backToArticles }}
      >
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {article.date && (
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2">
              <CalendarDays className="size-4 text-primary" aria-hidden /> {formatDate(article.date, locale)}
            </span>
          )}
          {venue && (
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2">
              <Landmark className="size-4 text-primary" aria-hidden /> {venue}
            </span>
          )}
          {article.link && (
            <Button asChild variant="outline" size="sm">
              <a href={article.link} target="_blank" rel="noopener noreferrer">
                {t.articlesPage.original} <ArrowUpRight className={cn(flipRtl)} />
              </a>
            </Button>
          )}
        </div>
      </PageHero>

      <article className="container-page pb-16">
        <div className="mx-auto max-w-3xl">
          {article.image && (
            <Reveal className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl border border-border">
              <Image src={article.image} alt="" fill priority sizes="(min-width: 768px) 768px, 100vw" unoptimized={isUpload(article.image)} className="object-cover" />
            </Reveal>
          )}
          <div className="glass rounded-3xl p-6 sm:p-10">
            {!isAr && article.titleAr && (
              <p lang="ar" dir="rtl" className="mb-2 font-display text-2xl font-medium leading-relaxed">
                {article.titleAr}
              </p>
            )}
            {!isAr && <p className="mb-6 text-sm text-muted-foreground">{t.ui.arabicOnly}</p>}
            {article.bodyAr ? (
              <BodyText text={article.bodyAr} lang="ar" figureLabel={t.articlesPage.figure} />
            ) : (
              <p className="text-lg leading-relaxed text-muted-foreground">{isAr ? article.summaryAr : article.summaryEn}</p>
            )}
          </div>
        </div>
      </article>

      {others.length > 0 && (
        <section className="container-page pb-24" aria-labelledby="more-articles">
          <h2 id="more-articles" className="mb-8 font-display text-3xl font-medium">
            {t.articlesPage.latest}
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((a) => (
              <li key={a.id}>
                <ArticleCard article={a} locale={locale} readLabel={t.articlesPage.readArticle} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
