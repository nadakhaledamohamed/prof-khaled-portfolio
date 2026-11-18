import { normalize } from "@/components/ui/filters";
import type { Book, Publication, PublicationCategory } from "@/types";

/**
 * Topic of a book, in the same three themes used for publications. Books carry no
 * category in the data, so it is read from the title and summary keywords.
 */
export function bookTopic(book: Book): PublicationCategory {
  return topicFromText([book.title, book.titleAr], [book.summaryEn, book.summaryAr]);
}

const RETRIEVAL = /retriev|search|استرجاع|محركات|semantic|دلالي|knowledge represent|تمثيل المعرفه/;
const LIBRARIES = /librar|مكتب|metadata|ميتاداتا|واصفات|catalog|فهرس/;

/**
 * Theme read from keywords, for items (books, articles) that have no category in the data.
 * The title decides first; the summary is only used when the title says nothing.
 */
export function topicFromText(title: (string | null | undefined)[], summary: (string | null | undefined)[] = []): PublicationCategory {
  for (const fields of [title, summary]) {
    const text = normalize(fields.filter(Boolean).join(" "));
    if (RETRIEVAL.test(text)) return "retrieval";
    if (LIBRARIES.test(text)) return "libraries";
  }
  return "other";
}

export type PubType = "paper" | "article" | "conference" | "study" | "report";

/**
 * Publication type for filtering. The data only records "paper" or "study", so the finer
 * types are read from the venue: proceedings and conferences are conference papers, and
 * work issued by a centre or company is a report.
 */
export function publicationType(p: Publication): PubType {
  const venue = normalize(`${p.venue} ${p.venueAr}`);
  if (/conference|proceedings|symposium|مؤتمر|ندوه/.test(venue)) return "conference";
  if (/\breport\b|تقرير|\bcent(er|re)\b|\bco\.|مركز|شركه/.test(venue)) return "report";
  return p.kind === "study" ? "study" : "paper";
}

/** Normalized text to search, computed once per item. */
export function searchIndex(...fields: (string | null | undefined | number)[]) {
  return normalize(fields.filter((f) => f !== null && f !== undefined && f !== "").join(" "));
}

/** Every word of the query must appear somewhere in the index. */
export function hit(index: string, query: string) {
  const q = normalize(query.trim());
  return !q || q.split(/\s+/).every((word) => index.includes(word));
}
