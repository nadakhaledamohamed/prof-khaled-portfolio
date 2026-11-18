export type PublicationCategory = "retrieval" | "libraries" | "other";

export interface Publication {
  id: string;
  /** Peer-reviewed paper or commissioned study/report. */
  kind: "paper" | "study";
  title: string;
  titleAr: string;
  authors: string;
  authorsAr: string;
  venue: string;
  venueAr: string;
  year: number;
  citations: number;
  category: PublicationCategory;
  link: string | null;
  /** ISBN, ISSN or other identifier. */
  ident: string;
  /** Full text or extended abstract (Arabic), shown on the publication page. */
  abstractAr: string;
}

export interface Book {
  id: string;
  title: string;
  titleAr: string | null;
  authorsEn: string;
  authorsAr: string;
  publisher: string;
  publisherAr: string;
  year: number | null;
  language: "ar" | "en";
  cover: string;
  isbn: string;
  summaryEn: string;
  summaryAr: string;
  citations: number | null;
  /** Full PDF of the book, if any. */
  pdf: string | null;
  /** Full-text e-book (JSON chapters), if any. */
  ebook: string | null;
  /** Table of contents for the PDF: one "Title | page" per line, "-" prefixes for nesting. */
  toc: string;
  /** PDF page index minus printed page number. */
  tocOffset: number;
  /** External page for the book (publisher, store), if any. */
  url: string | null;
}

export interface Article {
  id: string;
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  /** Article text (Arabic). Lightweight markup: "## " headings, "- " bullets, "1. " lists, [[img:/path]] figures. */
  bodyAr: string;
  date: string;
  image: string | null;
  link: string | null;
  venueEn: string;
  venueAr: string;
}

export interface Lecture {
  titleEn: string;
  titleAr: string;
  file: string | null;
  pages: number;
}

export interface Talk {
  id: string;
  track: "course" | "talk";
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  eventEn: string;
  eventAr: string;
  placeEn: string;
  placeAr: string;
  /** Course outline (Arabic), one line per lecture. */
  outlineAr: string;
  image: string | null;
  lectures: Lecture[];
}

export interface Video {
  id: string;
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  eventEn: string;
  eventAr: string;
  link: string;
  image: string | null;
  date: string;
}

export type SystemCategory = "ils" | "repo" | "access";

export interface SystemReview {
  id: string;
  num: number;
  nameEn: string;
  nameAr: string;
  fullNameEn: string;
  fullNameAr: string;
  cats: SystemCategory[];
  license: "open" | "commercial" | "platform" | "other";
  link: string;
  date: string;
  funcEn: string;
  funcAr: string;
  useEn: string;
  useAr: string;
  perfEn: string;
  perfAr: string;
  costEn: string;
  costAr: string;
  supportEn: string;
  supportAr: string;
  noteEn: string;
  noteAr: string;
  strengthsEn: string;
  strengthsAr: string;
  highlight: boolean;
}

export interface SystemsReport {
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  bodyAr: string;
  date: string;
}

export interface OpenResource {
  id: string;
  num: number;
  groupEn: string;
  groupAr: string;
  title: string;
  summaryEn: string;
  summaryAr: string;
  link: string;
}

export interface CvSection {
  id: string;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
}

export type MetricId = "citations" | "h-index" | "i10-index" | "years";

export interface MetricValue {
  id: MetricId;
  value: number;
  suffix?: string;
}

export interface MetricsSince {
  year: number;
  citations: number;
  h: number;
  i10: number;
  /** Date the Google Scholar figures were last copied (YYYY-MM-DD). */
  updated: string;
}

export interface TimelineEntry {
  period: string;
  title: string;
  organization: string;
  location?: string;
  note?: string;
}

export type FocusIcon = "search" | "library" | "globe" | "tags" | "handshake" | "flask";

export interface FocusArea {
  icon: FocusIcon;
  title: string;
  description: string;
}

export interface Award {
  title: string;
  issuer: string;
  year?: string;
  description: string;
  featured?: boolean;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export type SocialIcon = "scholar" | "university" | "foundation" | "linkedin" | "facebook" | "email";

export interface SocialLink {
  icon: SocialIcon;
  url: string;
}

export interface Collaborator {
  id: string;
  name: string;
  affiliationEn: string;
  affiliationAr: string;
}

/** Gallery entry as stored (both languages). */
export interface GalleryEntry {
  id: string;
  type: "image" | "pdf";
  src: string;
  titleEn: string;
  titleAr: string;
  captionEn: string;
  captionAr: string;
}

/** Gallery entry resolved for one language. */
export interface GalleryItem {
  type: "image" | "pdf";
  title: string;
  caption: string;
  src: string;
}

export interface SiteLinks {
  photo: string;
  banner: string;
  cv: string;
  scholar: string;
  fayoum: string;
  mbrf: string;
  linkedin: string;
  facebook: string;
  email: string;
}

/** Language-independent, admin-editable data. */
export interface SiteData {
  links: SiteLinks;
  verifiedDomain: string;
  metrics: MetricValue[];
  metricsSince: MetricsSince;
  books: Book[];
  publications: Publication[];
  articles: Article[];
  talks: Talk[];
  videos: Video[];
  systems: SystemReview[];
  systemsReport: SystemsReport;
  openLibrary: OpenResource[];
  cv: CvSection[];
  collaborators: Collaborator[];
  gallery: GalleryEntry[];
}

export type NavId =
  | "about"
  | "impact"
  | "journey"
  | "research"
  | "books"
  | "publications"
  | "gallery"
  | "contact";

/** Stand-alone pages (each exists in both languages). */
export type PageId =
  | "cv"
  | "publications"
  | "books"
  | "articles"
  | "talks"
  | "videos"
  | "systems"
  | "library"
  | "gallery"
  | "consult";
