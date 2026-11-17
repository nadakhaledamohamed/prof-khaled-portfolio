export type PublicationCategory = "retrieval" | "libraries" | "other";

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  citations: number;
  category: PublicationCategory;
}

export interface Book {
  id: string;
  title: string;
  titleAr: string | null;
  publisher: string;
  publisherAr: string;
  year: number | null;
  language: "ar" | "en";
  cover: string;
  /** Uploaded PDF of the book, if any. */
  pdf: string | null;
  /** External page for the book (publisher, store), if any. */
  url: string | null;
}

export type MetricId = "citations" | "h-index" | "i10-index" | "years";

export interface MetricValue {
  id: MetricId;
  value: number;
  suffix?: string;
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

export type SocialIcon = "scholar" | "university" | "foundation";

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
  cv: string;
  scholar: string;
  fayoum: string;
  mbrf: string;
}

/** Language-independent, admin-editable data. */
export interface SiteData {
  links: SiteLinks;
  verifiedDomain: string;
  metrics: MetricValue[];
  books: Book[];
  publications: Publication[];
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
