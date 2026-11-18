import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { isUpload } from "@/data/site";
import { href, type Locale } from "@/i18n/config";
import { cn, flipRtl } from "@/lib/utils";
import type { Article } from "@/types";

export function formatDate(date: string, locale: Locale) {
  if (!date) return "";
  if (/^\d{4}$/.test(date)) return date;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { year: "numeric", month: "long", day: "numeric" }).format(d);
}

/** Article teaser card: cover (or a typographic fallback), venue, date, summary. */
export function ArticleCard({ article, locale, readLabel, featured }: { article: Article; locale: Locale; readLabel: string; featured?: boolean }) {
  const isAr = locale === "ar";
  const title = isAr ? article.titleAr : article.titleEn || article.titleAr;
  const summary = isAr ? article.summaryAr : article.summaryEn || article.summaryAr;
  const venue = isAr ? article.venueAr : article.venueEn;
  const link = href(locale, `/articles/${article.id}`);

  return (
    <article className={cn("glass group relative flex h-full flex-col overflow-hidden rounded-3xl transition-[translate,border-color] duration-500 hover:-translate-y-1 hover:border-primary/40", featured && "md:flex-row")}>
      <div className={cn("relative aspect-[16/9] shrink-0 overflow-hidden bg-muted", featured && "md:aspect-auto md:w-1/2")}>
        {article.image ? (
          <Image
            src={article.image}
            alt=""
            fill
            sizes={featured ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            unoptimized={isUpload(article.image)}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="bg-brand absolute inset-0 grid place-items-center opacity-90">
            <Newspaper className="size-12 text-white/80" aria-hidden />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {article.date && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden /> {formatDate(article.date, locale)}
            </span>
          )}
          {venue && <span className="truncate">{venue}</span>}
        </div>
        <h3 lang={isAr || !article.titleEn ? "ar" : "en"} className={cn("font-display font-medium leading-snug text-balance transition-colors group-hover:text-primary rtl:leading-relaxed", featured ? "text-2xl sm:text-3xl" : "text-xl")}>
          <Link href={link} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h3>
        {summary && <p className={cn("mt-3 text-sm leading-relaxed text-muted-foreground", featured ? "line-clamp-5" : "line-clamp-3")}>{summary}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-primary">
          {readLabel}
          <ArrowRight className={cn("size-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1", flipRtl)} aria-hidden />
        </span>
      </div>
    </article>
  );
}
