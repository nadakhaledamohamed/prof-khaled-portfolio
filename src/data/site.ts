/**
 * Static configuration plus the default, language-independent data.
 * The defaults seed the database the first time the site runs; after that the
 * admin panel is the source of truth. Translatable copy lives in src/content/{en,ar}.ts.
 */
import type {
  Book,
  GalleryEntry,
  NavId,
  Publication,
  PublicationCategory,
  SiteData,
  SiteLinks,
  SocialLink,
} from "@/types";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const monogram = "KM";

export const navIds: NavId[] = [
  "about",
  "impact",
  "journey",
  "research",
  "books",
  "publications",
  "gallery",
  "contact",
];

/** Every section id on the page, in document order (used for active-section tracking). */
export const sectionIds = [
  "top",
  "about",
  "impact",
  "journey",
  "research",
  "books",
  "publications",
  "awards",
  "gallery",
  "network",
  "contact",
] as const;

export const categories: PublicationCategory[] = ["retrieval", "libraries", "other"];

/** Files uploaded through the admin panel live in Vercel Blob and skip image optimisation. */
export function isUpload(src: string) {
  return src.includes(".blob.vercel-storage.com/");
}

export function socialLinksFrom(links: SiteLinks): SocialLink[] {
  return [
    { icon: "scholar", url: links.scholar },
    { icon: "university", url: links.fayoum },
    { icon: "foundation", url: links.mbrf },
  ].filter((link): link is SocialLink => Boolean(link.url));
}

/* ---------- Defaults ---------- */

const defaultLinks: SiteLinks = {
  photo: "/images/profile.jpg",
  cv: "/cv.pdf",
  scholar: "https://scholar.google.com/citations?user=WeD0AcoAAAAJ&hl=en",
  fayoum: "https://www.fayoum.edu.eg/",
  mbrf: "https://www.mbrf.ae/",
};

const defaultBooks: Book[] = [
  {
    id: "knowledge-science",
    title: "Knowledge Science: From Data to Measurements",
    titleAr: "علوم المعرفة: من البيانات إلى القياسات",
    publisher: "Qindeel Publishing, Dubai",
    publisherAr: "دار قنديل للنشر، دبي",
    year: 2025,
    language: "ar",
    cover: "/images/books/knowledge-science.jpg",
    pdf: null,
    url: null,
  },
  {
    id: "knowledge-markets",
    title: "Knowledge Markets: Dynamics, Challenges & Opportunities in the Digital Age",
    titleAr: "أسواق المعرفة: الديناميكيات والتحديات والفرص في العصر الرقمي",
    publisher: "Qindeel · MBRF, Dubai",
    publisherAr: "قنديل · مؤسسة محمد بن راشد آل مكتوم للمعرفة، دبي",
    year: 2025,
    language: "ar",
    cover: "/images/books/knowledge-markets.jpg",
    pdf: null,
    url: null,
  },
  {
    id: "advanced-systems",
    title: "Advanced Systems in Libraries & Information Institutions",
    titleAr: "النظم المتطورة في المكتبات ومؤسسات المعلومات",
    publisher: "House 101 for Publishing",
    publisherAr: "دار 101 للنشر",
    year: 2025,
    language: "ar",
    cover: "/images/books/advanced-systems.jpg",
    pdf: null,
    url: null,
  },
  {
    id: "knowledge-representation",
    title: "Knowledge Representation & Digital Information Retrieval",
    titleAr: "تمثيل المعرفة واسترجاع المعلومات الرقمية",
    publisher: "Qindeel Publishing, Dubai",
    publisherAr: "دار قنديل للنشر، دبي",
    year: 2019,
    language: "ar",
    cover: "/images/books/knowledge-representation.jpg",
    pdf: null,
    url: null,
  },
  {
    id: "internet-technologies",
    title: "The Internet: Components, Technologies & Applications in Libraries",
    titleAr: "الإنترنت: المكونات والتكنولوجيات والتطبيقات في المكتبات ومؤسسات المعلومات",
    publisher: "Dar El Mutanabi, Riyadh",
    publisherAr: "دار المتنبي، الرياض",
    year: null,
    language: "ar",
    cover: "/images/books/internet-technologies.jpg",
    pdf: null,
    url: null,
  },
  {
    id: "semantic-web",
    title: "Semantic Web Applications in Libraries",
    titleAr: "الويب الدلالي وتطبيقاته في المكتبات",
    publisher: "Dar El Mutanabi, Riyadh",
    publisherAr: "دار المتنبي، الرياض",
    year: 2016,
    language: "ar",
    cover: "/images/books/semantic-web.jpg",
    pdf: null,
    url: null,
  },
  {
    id: "metadata",
    title: "Metadata: Theoretical Foundations & Practical Applications",
    titleAr: "الميتاداتا: أسسها النظرية وتطبيقاتها العملية",
    publisher: "Dar El Masria El Lubnania · with M. F. Abd El Hady",
    publisherAr: "الدار المصرية اللبنانية · بالاشتراك مع م. ف. عبد الهادي",
    year: 2013,
    language: "ar",
    cover: "/images/books/metadata.jpg",
    pdf: null,
    url: null,
  },
  {
    id: "how-to-write",
    title: "How to Write & Publish a Scientific Research Paper",
    titleAr: "كيف تكتب بحثًا علميًا وتنشره",
    publisher: "Translation · MBRF / Dar El Masria El Lubnania",
    publisherAr: "ترجمة · مؤسسة محمد بن راشد آل مكتوم للمعرفة / الدار المصرية اللبنانية",
    year: null,
    language: "ar",
    cover: "/images/books/how-to-write.jpg",
    pdf: null,
    url: null,
  },
  {
    id: "merging-search-results",
    title: "Merging Multiple Search Results Approach for Meta-Search Engines",
    titleAr: null,
    publisher: "VDM Publishing Group · 204 pp.",
    publisherAr: "مجموعة VDM للنشر · 204 صفحات",
    year: 2009,
    language: "en",
    cover: "/images/books/merging-search-results.jpg",
    pdf: null,
    url: null,
  },
];

const defaultPublications: Publication[] = [
  {
    id: "p-metadata-2006",
    title: "The impact of metadata in web resources discovering",
    authors: "K. A. F. Mohamed",
    venue: "Online Information Review · 30(2): 155–167",
    year: 2006,
    citations: 32,
    category: "retrieval",
  },
  {
    id: "p-web-usage-2008",
    title: "Web usage mining analysis of federated search tools for Egyptian scholars",
    authors: "K. A. Mohamed, A. Hassan",
    venue: "Program: Electronic Library and Information Systems · 42(4): 418–435",
    year: 2008,
    citations: 20,
    category: "retrieval",
  },
  {
    id: "p-federated-2015",
    title: "Evaluating federated search tools: usability and retrievability framework",
    authors: "K. A. Mohamed, A. Hassan",
    venue: "The Electronic Library · 33(6): 1079–1099",
    year: 2015,
    citations: 15,
    category: "retrieval",
  },
  {
    id: "p-dissertation-2005",
    title: "Merging multiple search results approach for meta-search engines",
    authors: "K. A. F. Mohamed",
    venue: "Ph.D. Dissertation · University of Pittsburgh",
    year: 2005,
    citations: 10,
    category: "retrieval",
  },
  {
    id: "p-ict-2008",
    title:
      "Quantifying the ICT needs of academic institutes using the service category–stakeholder matrix approach",
    authors: "M. El-Hadidi, H. Anis, S. El-Akabawi, A. Fahmy, K. A. Mohamed, et al.",
    venue: "ITI 6th International Conference on Information & Communications Technology",
    year: 2008,
    citations: 9,
    category: "other",
  },
  {
    id: "p-digital-libraries-2009",
    title: "The role of digital libraries in Egyptian higher education",
    authors: "E. S. Taie, K. A. Mohamed",
    venue: "Digest of Middle East Studies · 18(2): 40–56",
    year: 2009,
    citations: 8,
    category: "libraries",
  },
  {
    id: "p-otitis-2020",
    title:
      "Otitis externa in a tertiary care hospital in Zagazig, Egypt: isolated pathogens and antibiotic sensitivity",
    authors:
      "A. A. E. Allam, A. E. E. Tantawy, K. A. E. Mohamed, E. A. Morad, M. A. E. El Shafei",
    venue: "African Journal of Clinical & Experimental Microbiology · 21(1): 60",
    year: 2020,
    citations: 7,
    category: "other",
  },
  {
    id: "p-software-2012",
    title: "Software evaluation methodology: two case studies from Egyptian universities",
    authors: "K. A. Mohamed, A. H. Yousef",
    venue: "Conference Proceedings",
    year: 2012,
    citations: 5,
    category: "other",
  },
  {
    id: "p-consortium-2013",
    title:
      "The role of the Egyptian University Libraries Consortium in developing a knowledge society",
    authors: "K. A. F. Mohamed",
    venue: "Faculty of Arts Conference Proceedings (Arabic)",
    year: 2013,
    citations: 4,
    category: "libraries",
  },
  {
    id: "p-union-catalog-2011",
    title: "The union catalog of Egyptian university libraries: a case study",
    authors: "K. A. F. Mohamed",
    venue: "Al-Fihrist · 85(197) (Arabic)",
    year: 2011,
    citations: 3,
    category: "libraries",
  },
  {
    id: "p-roi-2010",
    title:
      "Measuring the return on investment in consortial subscriptions to electronic journals",
    authors: "K. A. F. Mohamed",
    venue: "Library & Information Studies (Arabic)",
    year: 2010,
    citations: 3,
    category: "libraries",
  },
  {
    id: "p-concept-building-2010",
    title:
      "Concept building and the problem of term semantics in user interaction with information retrieval systems",
    authors: "K. A. F. Mohamed",
    venue: "Library & Information Studies (Arabic)",
    year: 2010,
    citations: 2,
    category: "retrieval",
  },
  {
    id: "p-duplicate-pages-2007",
    title: "The credibility of search engines in indexing and ranking duplicate pages",
    authors: "K. A. F. Mohamed",
    venue: "Library & Information Studies (Arabic)",
    year: 2007,
    citations: 2,
    category: "retrieval",
  },
];

const defaultGallery: GalleryEntry[] = [
  {
    id: "g-portrait",
    type: "image",
    src: defaultLinks.photo,
    titleEn: "Portrait",
    titleAr: "صورة شخصية",
    captionEn: "Prof. Khaled Abd El Fatah Mohamed",
    captionAr: "أ.د. خالد عبد الفتاح محمد",
  },
  ...defaultBooks.map<GalleryEntry>((book) => ({
    id: `g-${book.id}`,
    type: "image",
    src: book.cover,
    titleEn: book.title,
    titleAr: book.titleAr ?? book.title,
    captionEn: ["Book cover", book.publisher, book.year].filter(Boolean).join(" · "),
    captionAr: ["غلاف كتاب", book.publisherAr, book.year].filter(Boolean).join(" · "),
  })),
  {
    id: "g-cv",
    type: "pdf",
    src: defaultLinks.cv,
    titleEn: "Curriculum Vitae (2026)",
    titleAr: "السيرة الذاتية (2026)",
    captionEn: "PDF document",
    captionAr: "مستند PDF",
  },
];

export const defaultData: SiteData = {
  links: defaultLinks,
  verifiedDomain: "fayoum.edu.eg",
  metrics: [
    { id: "citations", value: 101 },
    { id: "h-index", value: 7 },
    { id: "i10-index", value: 4 },
    { id: "years", value: 20, suffix: "+" },
  ],
  books: defaultBooks,
  publications: defaultPublications,
  collaborators: [
    {
      id: "c-yousef",
      name: "Ahmed Hassan M. Yousef",
      affiliationEn: "Elsewedy University of Technology",
      affiliationAr: "جامعة السويدي للتكنولوجيا",
    },
    {
      id: "c-medhat",
      name: "Walaa Medhat",
      affiliationEn: "Nile University",
      affiliationAr: "جامعة النيل",
    },
    {
      id: "c-awadallah",
      name: "Ahmed H. Awadallah",
      affiliationEn: "Microsoft Research",
      affiliationAr: "مايكروسوفت للأبحاث",
    },
  ],
  gallery: defaultGallery,
};

/* ---------- Derived statistics for the impact dashboard ---------- */

export function computeStats(publications: Publication[]) {
  const topCited = [...publications].sort((a, b) => b.citations - a.citations).slice(0, 6);

  const themeStats = categories.map((category) => {
    const items = publications.filter((p) => p.category === category);
    return {
      category,
      works: items.length,
      citations: items.reduce((sum, p) => sum + p.citations, 0),
      share: publications.length ? items.length / publications.length : 0,
    };
  });

  const years = publications.map((p) => p.year);
  const firstYear = years.length ? Math.min(...years) : new Date().getFullYear();
  const lastYear = years.length ? Math.max(...years) : firstYear;
  const yearStats = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => {
    const year = firstYear + i;
    const items = publications.filter((p) => p.year === year);
    return {
      year,
      works: items.length,
      citations: items.reduce((sum, p) => sum + p.citations, 0),
    };
  });

  return { topCited, themeStats, yearStats };
}

export type Stats = ReturnType<typeof computeStats>;
