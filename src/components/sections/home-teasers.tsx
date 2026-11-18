import Link from "next/link";
import { ArrowRight, BookOpenText, Library, MessagesSquare, Server } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ArticleCard } from "@/components/pages/article-card";
import { TalksExplorer } from "@/components/pages/talks-explorer";
import { VideoGrid } from "@/components/pages/video-grid";
import { Rich } from "@/components/rich";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/content/types";
import { pagePaths } from "@/data/site";
import { href, type Locale } from "@/i18n/config";
import { arrowNudge, cn, flipRtl } from "@/lib/utils";
import type { SiteData } from "@/types";

function ViewAll({ to, label }: { to: string; label: string }) {
  return (
    <Button asChild variant="outline">
      <Link href={to}>
        {label} <ArrowRight className={cn(arrowNudge, flipRtl)} />
      </Link>
    </Button>
  );
}

export function LatestArticles({ t, locale, articles }: { t: Pick<Dictionary, "homeTeasers" | "pages" | "articlesPage" | "ui">; locale: Locale; articles: SiteData["articles"] }) {
  if (!articles.length) return null;
  const [first, ...rest] = articles;
  return (
    <Section id="articles">
      <div className="mb-12 flex flex-col gap-6 sm:mb-16 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading id="articles" index="07" eyebrow={t.pages.articles.eyebrow} title={t.homeTeasers.articlesTitle} description={t.pages.articles.description} className="mb-0 sm:mb-0" />
        <ViewAll to={href(locale, `/${pagePaths.articles}`)} label={`${t.ui.viewAll} (${articles.length})`} />
      </div>
      <div className="grid gap-5">
        <Reveal>
          <ArticleCard article={first} locale={locale} readLabel={t.articlesPage.readArticle} featured />
        </Reveal>
        <Stagger role="list" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.slice(0, 3).map((article) => (
            <StaggerItem key={article.id} role="listitem">
              <ArticleCard article={article} locale={locale} readLabel={t.articlesPage.readArticle} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}

export function TalksTeaser({ t, locale, data }: { t: Pick<Dictionary, "homeTeasers" | "pages" | "talksPage" | "videosPage" | "ui">; locale: Locale; data: SiteData }) {
  return (
    <Section id="talks">
      <div className="mb-12 flex flex-col gap-6 sm:mb-16 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading id="talks" index="08" eyebrow={t.pages.talks.eyebrow} title={t.homeTeasers.talksTitle} description={t.pages.talks.description} className="mb-0 sm:mb-0" />
        <ViewAll to={href(locale, `/${pagePaths.talks}`)} label={`${t.ui.viewAll} (${data.talks.length})`} />
      </div>
      <Reveal>
        <TalksExplorer talks={data.talks} locale={locale} t={{ ui: t.ui, talksPage: t.talksPage }} limit={3} />
      </Reveal>

      {data.videos.length > 0 && (
        <div className="mt-20">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h3 className="font-display text-3xl font-medium sm:text-4xl">
              <Rich text={t.homeTeasers.videosTitle} />
            </h3>
            <ViewAll to={href(locale, `/${pagePaths.videos}`)} label={`${t.ui.viewAll} (${data.videos.length})`} />
          </div>
          <Reveal>
            <VideoGrid videos={data.videos} locale={locale} t={{ ui: t.ui, videosPage: t.videosPage }} limit={3} />
          </Reveal>
        </div>
      )}
    </Section>
  );
}

export function LibraryTeaser({ t, locale, data }: { t: Pick<Dictionary, "homeTeasers" | "menu" | "booksPage">; locale: Locale; data: SiteData }) {
  const ebook = data.books.find((b) => b.ebook) ?? data.books.find((b) => b.pdf);
  const cards = [
    ebook && {
      to: href(locale, ebook.ebook ? `/books/${ebook.id}/read` : `/books/${ebook.id}`),
      icon: BookOpenText,
      title: t.booksPage.readOnline,
      text: locale === "ar" ? ebook.titleAr || ebook.title : ebook.title,
      count: data.books.filter((b) => b.ebook || b.pdf).length,
    },
    { to: href(locale, `/${pagePaths.systems}`), icon: Server, title: t.menu.items.systems, text: t.menu.hints.systems, count: data.systems.length },
    { to: href(locale, `/${pagePaths.library}`), icon: Library, title: t.menu.items.library, text: t.menu.hints.library, count: data.openLibrary.length },
  ].filter(Boolean) as { to: string; icon: typeof Server; title: string; text: string; count: number }[];

  return (
    <Section id="library" aria-labelledby="library-title">
      <div className="relative overflow-hidden rounded-[2rem] border border-border p-6 sm:p-12">
        <div aria-hidden className="bg-brand absolute -end-24 -top-24 size-72 rounded-full opacity-20 blur-3xl" />
        <Reveal className="relative mb-10 max-w-2xl">
          <h2 id="library-title" className="font-display text-3xl font-medium leading-tight sm:text-5xl rtl:leading-snug">
            <Rich text={t.homeTeasers.libraryTitle} />
          </h2>
          <p className="mt-4 text-muted-foreground sm:text-lg">{t.homeTeasers.libraryText}</p>
        </Reveal>
        <Stagger role="list" className="relative grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <StaggerItem key={card.to} role="listitem">
              <Link href={card.to} className="glass group flex h-full flex-col rounded-3xl p-6 transition-[translate,border-color] duration-500 hover:-translate-y-1 hover:border-primary/40">
                <div className="flex items-center justify-between">
                  <span className="neu grid size-12 place-items-center rounded-2xl text-primary transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                    <card.icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-display text-4xl font-medium tabular-nums text-muted-foreground/60">{card.count}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold transition-colors group-hover:text-primary">{card.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{card.text}</p>
                <ArrowRight className={cn("mt-auto size-5 pt-0 text-primary transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1", flipRtl)} aria-hidden />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}

export function ConsultCta({ t, locale }: { t: Pick<Dictionary, "homeTeasers" | "menu">; locale: Locale }) {
  return (
    <section aria-labelledby="consult-cta" className="relative z-10 pb-8">
      <div className="container-page">
        <Reveal>
          <div className="bg-brand relative overflow-hidden rounded-[2rem] p-8 text-white sm:p-14 dark:text-[#070a12]">
            <div aria-hidden className="absolute -bottom-20 -end-10 size-72 rounded-full bg-white/15 blur-2xl" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h2 id="consult-cta" className="font-display text-3xl font-medium leading-tight sm:text-5xl [&_em]:text-inherit [&_em]:[-webkit-text-fill-color:currentColor] rtl:leading-snug">
                  <Rich text={t.homeTeasers.consultTitle} emClassName="" />
                </h2>
                <p className="mt-4 opacity-85 sm:text-lg">{t.homeTeasers.consultText}</p>
              </div>
              <Button asChild size="lg" className="bg-white text-[#0e1525] shadow-xl hover:bg-white/90 hover:text-[#0e1525]">
                <Link href={href(locale, `/${pagePaths.consult}`)}>
                  <MessagesSquare /> {t.menu.consult}
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
