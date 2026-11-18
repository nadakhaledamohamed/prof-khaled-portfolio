import type { Locale } from "@/i18n/config";
import type { ContactErrorCode, ContactResultCode } from "@/lib/contact-schema";
import type {
  Award,
  FocusArea,
  MetricId,
  NavId,
  PageId,
  PublicationCategory,
  SiteData,
  SocialIcon,
  SystemCategory,
  SystemReview,
  Testimonial,
  TimelineEntry,
} from "@/types";

/** Everything the public site renders: both dictionaries plus shared data. Stored as one JSON document. */
export interface SiteContent {
  en: Dictionary;
  ar: Dictionary;
  data: SiteData;
}

/** Dictionary sections the admin can edit as text (all except `locale`). */
export type TextSectionKey = Exclude<keyof Dictionary, "locale">;

/**
 * Section headings. In `title`, wrap a phrase in *asterisks* for the gradient accent.
 * In body copy, wrap a phrase in **double asterisks** for bold.
 */
export interface SectionCopy {
  eyebrow: string;
  title: string;
  description?: string;
}

export interface Dictionary {
  locale: Locale;
  meta: { title: string; description: string; ogLocale: string; keywords: string[] };
  profile: {
    name: string;
    fullTitle: string;
    shortName: string;
    cardName: string;
    tagline: string;
    role: string;
    affiliation: string;
    field: string;
    footerRole: string;
  };
  common: {
    skipToContent: string;
    loading: string;
    downloadCv: string;
    cvShort: string;
    scholar: string;
    opensNewTab: string;
    backToTop: string;
    homeAria: string;
    /** Link to the other language, written in that language. */
    switchLanguage: { label: string; short: string };
    themeToDark: string;
    themeToLight: string;
    openMenu: string;
    closeMenu: string;
    siteNavigation: string;
    primaryNav: string;
    footerNav: string;
  };
  nav: Record<NavId, string>;
  hero: {
    introLabel: string;
    eyebrow: string;
    nameLine1: string;
    nameLine2: string;
    lede: string;
    fieldsLabel: string;
    tags: string[];
    ctaPublications: string;
    cardAffiliation: string;
    cardField: string;
    cardVerified: string;
    miniLabels: [string, string, string];
    chipBooks: string;
    chipAward: string;
    scroll: string;
    scrollAria: string;
  };
  marquee: { label: string; institutions: string[] };
  about: SectionCopy & {
    question: string;
    questionCaption: string;
    paragraphs: string[];
    facts: { value: string; label: string }[];
  };
  impact: SectionCopy & {
    metrics: Record<MetricId, { label: string; description: string }>;
    dashboardTitle: string;
    dashboardSubtitle: string;
    tablistLabel: string;
    tabs: { works: string; themes: string; years: string };
    citationsSr: string;
    /** {works} {citations} */
    worksAndCitations: string;
    /** {pct} */
    share: string;
    yearsHint: string;
    /** {year} {works} {citations} */
    yearDetail: string;
  };
  journey: SectionCopy & {
    experienceTitle: string;
    educationTitle: string;
    experience: TimelineEntry[];
    education: TimelineEntry[];
  };
  research: SectionCopy & { areas: FocusArea[] };
  books: SectionCopy & {
    languages: { ar: string; en: string };
    /** {title} */
    coverAlt: string;
    readPdf: string;
    viewOnline: string;
  };
  publications: SectionCopy & {
    categories: Record<PublicationCategory, string>;
    all: string;
    filterLabel: string;
    searchLabel: string;
    searchPlaceholder: string;
    sortLabel: string;
    sorts: { citations: string; newest: string; oldest: string };
    /** {n} */
    countOne: string;
    /** {n} */
    countMany: string;
    citationOne: string;
    citationMany: string;
    emptyTitle: string;
    clearFilters: string;
    scholarCta: string;
    note?: string;
  };
  awards: SectionCopy & { items: Award[] };
  gallery: SectionCopy & {
    filterLabel: string;
    filters: { all: string; image: string; pdf: string };
    /** {title} */
    viewImage: string;
    close: string;
    prev: string;
    next: string;
  };
  network: SectionCopy & {
    testimonials: Testimonial[];
    placeholders: Testimonial[];
    placeholderBadge: string;
    carouselLabel: string;
    /** {i} {n} */
    showTestimonial: string;
    prev: string;
    next: string;
  };
  contact: SectionCopy & {
    links: Record<SocialIcon, { title: string; subtitle: string }>;
    formLabel: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    subject: string;
    subjectPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    required: string;
    send: string;
    sending: string;
    successTitle: string;
    sendAnother: string;
    honeypot: string;
    errors: Record<ContactErrorCode, string>;
    results: Record<ContactResultCode, string>;
  };
  footer: { explore: string; elsewhere: string; rights: string; dataSource: string };
  notFound: { title: string; text: string; back: string };
  /** Heading of each stand-alone page. */
  pages: Record<PageId, SectionCopy>;
  /** Navigation menus. */
  menu: {
    home: string;
    about: string;
    work: string;
    media: string;
    resources: string;
    consult: string;
    items: Record<PageId, string>;
    /** Short description under each menu item. */
    hints: Record<PageId, string>;
  };
  /** Shared UI labels on the content pages. */
  ui: {
    search: string;
    searchPlaceholder: string;
    all: string;
    noResults: string;
    clear: string;
    viewAll: string;
    readMore: string;
    back: string;
    open: string;
    download: string;
    externalSource: string;
    /** {n} */
    results: string;
    arabicOnly: string;
    updated: string;
    since: string;
  };
  heritage: { eyebrow: string; title: string; text: string };
  cvPage: { download: string; sections: string };
  booksPage: {
    authors: string;
    publisher: string;
    year: string;
    isbn: string;
    citations: string;
    readOnline: string;
    openPdf: string;
    contents: string;
    page: string;
    backToBooks: string;
    readerHint: string;
    ebookBadge: string;
    pdfBadge: string;
  };
  publicationsPage: {
    kinds: { all: string; paper: string; study: string };
    fullText: string;
    details: string;
    venue: string;
    backToList: string;
    sinceLabel: string;
  };
  articlesPage: {
    readArticle: string;
    original: string;
    backToArticles: string;
    latest: string;
    figure: string;
  };
  talksPage: {
    tabs: { all: string; course: string; talk: string };
    /** {n} */
    lectures: string;
    /** {n} */
    pages: string;
    outline: string;
    openPdf: string;
    close: string;
  };
  videosPage: { watch: string; external: string; close: string };
  systemsPage: {
    cats: Record<SystemCategory, string>;
    licenses: Record<SystemReview["license"], string>;
    indicators: { func: string; use: string; perf: string; cost: string; support: string };
    visit: string;
    report: string;
    reportOpen: string;
    category: string;
    license: string;
    highlight: string;
    indicatorsLabel: string;
    categoriesLabel: string;
  };
  libraryPage: { visit: string; groups: string };
  consultPage: {
    types: { research: string; knowledge: string; technical: string; technology: string; other: string };
    type: string;
    phone: string;
    phonePlaceholder: string;
    organization: string;
    organizationPlaceholder: string;
    details: string;
    detailsPlaceholder: string;
    submit: string;
    successTitle: string;
    successText: string;
    optional: string;
  };
  homeTeasers: {
    articlesTitle: string;
    talksTitle: string;
    videosTitle: string;
    libraryTitle: string;
    libraryText: string;
    consultTitle: string;
    consultText: string;
  };
}
