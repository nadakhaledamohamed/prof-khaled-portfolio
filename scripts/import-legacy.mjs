#!/usr/bin/env node
/**
 * Imports the content export of the previous researcher site (khaled-website-local.zip,
 * extracted) into this project:
 *   - copies every file from data/assets (and the share image, favicon, Arabic fonts)
 *     into public/ and src/fonts/
 *   - converts data/db.json into src/data/legacy.json, the seed data the site starts from
 *
 *   node scripts/import-legacy.mjs <path-to-extracted-khaled-website-local>
 *
 * Safe to re-run: it overwrites the generated files only.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.argv[2];
if (!root || !existsSync(path.join(root, "data", "db.json"))) {
  console.error("Usage: node scripts/import-legacy.mjs <extracted khaled-website-local folder>");
  process.exit(1);
}

const web = process.cwd();
const db = JSON.parse(readFileSync(path.join(root, "data", "db.json"), "utf8"));
const assetsDir = path.join(root, "data", "assets");

/* ---------- Assets ---------- */

const contentDir = path.join(web, "public", "content");
mkdirSync(contentDir, { recursive: true });
const files = {};
for (const file of readdirSync(assetsDir)) {
  const [id] = file.split(".");
  files[id] = `/content/${file}`;
  copyFileSync(path.join(assetsDir, file), path.join(contentDir, file));
}
copyFileSync(path.join(root, "data", "og-image.jpg"), path.join(web, "public", "og-image.jpg"));
copyFileSync(path.join(root, "web", "favicon.png"), path.join(web, "src", "app", "apple-icon.png"));

const fontsOut = path.join(web, "src", "fonts");
mkdirSync(fontsOut, { recursive: true });
for (const font of readdirSync(path.join(root, "web", "fonts"))) {
  if (/^(amiri-arabic|ibm-plex-sans-arabic-arabic)-.*\.woff2$/.test(font)) {
    copyFileSync(path.join(root, "web", "fonts", font), path.join(fontsOut, font));
  }
}

const asset = (id) => (id ? (files[id] ?? null) : null);

/* ---------- Helpers ---------- */

const items = Object.entries(db)
  .filter(([key]) => key.startsWith("items/"))
  .map(([key, value]) => ({ id: key.slice("items/".length), ...value }));
const inSection = (section) =>
  items.filter((item) => item.sectionId === section).sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
const s = (value) => (typeof value === "string" ? value.trim() : "");
const num = (value) => {
  const n = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : null;
};
/** Rewrites inline figure tags ([[img:id]]) to the copied file path. */
const figures = (text) => s(text).replace(/\[\[img:([0-9a-f]{32})\]\]/g, (_, id) => `[[img:${asset(id) ?? id}]]`);

/* ---------- Site profile ---------- */

const site = db["site/main"];
const impact = site.impact ?? {};
const profile = {
  nameEn: s(site.name_en),
  nameAr: s(site.name),
  roleEn: s(site.role_en),
  roleAr: s(site.role),
  affiliationEn: s(site.affiliation_en),
  affiliationAr: s(site.affiliation),
  email: s(site.email),
  facebook: s(site.sFacebook),
  linkedin: s(site.sLinkedin),
  scholar: s(impact.scholarUrl),
  photo: asset(site.photoId),
  banner: asset(site.bannerId),
  bannerTitleEn: s(site.bannerTitle_en),
  bannerTitleAr: s(site.bannerTitle),
  bannerSubEn: s(site.bannerSub_en),
  bannerSubAr: s(site.bannerSub),
  welcomeTitleEn: s(site.welcomeTitle_en),
  welcomeTitleAr: s(site.welcomeTitle),
  welcomeEn: s(site.welcome_en),
  welcomeAr: s(site.welcome),
  impact: {
    citations: impact.citations ?? 0,
    h: impact.h ?? 0,
    i10: impact.i10 ?? 0,
    sinceYear: impact.since ?? null,
    citationsSince: impact.citations5 ?? 0,
    hSince: impact.h5 ?? 0,
    i10Since: impact.i105 ?? 0,
    updated: s(impact.updated),
  },
};

/* ---------- Sections (titles and intros) ---------- */

const sections = {};
for (const [key, value] of Object.entries(db)) {
  if (!key.startsWith("sections/")) continue;
  sections[value.key] = {
    titleEn: s(value.title_en),
    titleAr: s(value.title),
    introEn: s(value.intro_en),
    introAr: s(value.intro),
  };
}

/* ---------- Collections ---------- */

const books = inSection("books").map((b) => ({
  id: b.id.replace(/^book-/, ""),
  title: s(b.title_en) || s(b.title),
  titleAr: /[\u0600-\u06FF]/.test(s(b.title)) ? s(b.title) : null,
  authorsEn: s(b.authors_en) || s(b.authors),
  authorsAr: s(b.authors),
  publisher: s(b.publisher_en) || s(b.publisher),
  publisherAr: s(b.publisher),
  year: num(b.year),
  language: /[\u0600-\u06FF]/.test(s(b.title)) ? "ar" : "en",
  cover: asset(b.image),
  isbn: s(b.ident).replace(/^ISBN\s*/i, ""),
  summaryEn: s(b.summary_en),
  summaryAr: s(b.summary),
  citations: typeof b.citations === "number" ? b.citations : null,
  pdf: asset(b.ebookPdf),
  ebook: asset(b.ebook),
  toc: s(b.ebookToc),
  tocOffset: num(b.ebookOffset) ?? 0,
  url: s(b.link) || null,
}));

const categoryFor = (title) => {
  const t = title.toLowerCase();
  if (/(search|retriev|meta-?search|engine|index|metadata|semantic|ranking|knowledge representation)/.test(t)) return "retrieval";
  if (/(librar|consorti|catalog|repositor|thes|digital content|e-?journal|university)/.test(t)) return "libraries";
  return "other";
};

const publications = inSection("research").map((r) => {
  const titleEn = s(r.title_en);
  return {
    id: r.id,
    kind: r.id.startsWith("std-") ? "study" : "paper",
    title: titleEn || s(r.title),
    titleAr: /[\u0600-\u06FF]/.test(s(r.title)) ? s(r.title) : "",
    authors: s(r.authors_en) || s(r.authors),
    authorsAr: s(r.authors),
    venue: s(r.publisher_en) || s(r.publisher),
    venueAr: s(r.publisher),
    year: num(r.year) ?? (s(r.date).slice(0, 4) ? num(s(r.date).slice(0, 4)) : 0) ?? 0,
    citations: typeof r.citations === "number" ? r.citations : 0,
    category: categoryFor(titleEn || s(r.title)),
    link: s(r.link) || null,
    ident: s(r.ident),
    abstractAr: figures(r.body),
  };
});

/*
 * Merge the publication list the site had before (from Google Scholar):
 * same paper → keep the higher citation count; papers missing from the export are added.
 */
const previousFile = path.join(web, "scripts", "previous-publications.json");
if (existsSync(previousFile)) {
  const words = (t) => new Set(t.toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter((w) => w.length > 3));
  for (const prev of JSON.parse(readFileSync(previousFile, "utf8"))) {
    if (prev.add) {
      publications.push({
        id: prev.id,
        kind: "paper",
        title: prev.title,
        titleAr: prev.titleAr ?? "",
        authors: prev.authors,
        authorsAr: "",
        venue: prev.venue,
        venueAr: "",
        year: prev.year,
        citations: prev.citations,
        category: prev.category,
        link: null,
        ident: "",
        abstractAr: "",
      });
      continue;
    }
    const a = words(prev.title);
    let best = null;
    let score = 0;
    for (const p of publications) {
      const b = words(p.title);
      let shared = 0;
      for (const w of a) if (b.has(w)) shared++;
      const sc = shared / Math.max(1, Math.min(a.size, b.size));
      if (sc > score) [best, score] = [p, sc];
    }
    if (best && score >= 0.7) best.citations = Math.max(best.citations, prev.citations);
    else console.warn(`No match for previous publication: ${prev.title}`);
  }
}
publications.sort((a, b) => b.citations - a.citations || b.year - a.year);

const articles = inSection("articles")
  .map((a) => ({
    id: a.id,
    titleEn: s(a.title_en),
    titleAr: s(a.title),
    summaryEn: s(a.summary_en),
    summaryAr: s(a.summary),
    bodyAr: figures(a.body),
    date: s(a.date) || (a.year ? `${a.year}` : ""),
    image: asset(a.image),
    link: s(a.link) || null,
    venueEn: s(a.event_en) || s(a.publisher_en),
    venueAr: s(a.event) || s(a.publisher),
  }))
  .sort((a, b) => b.date.localeCompare(a.date));

const talks = inSection("talks").map((t) => ({
  id: t.id,
  track: t.track === "courses" ? "course" : "talk",
  titleEn: s(t.title_en) || s(t.title),
  titleAr: s(t.title),
  summaryEn: s(t.summary_en),
  summaryAr: s(t.summary),
  eventEn: s(t.event_en),
  eventAr: s(t.event),
  placeEn: s(t.place_en),
  placeAr: s(t.place),
  outlineAr: s(t.body),
  image: asset(t.image),
  lectures: (t.lectures ?? []).map((l) => ({
    titleEn: s(l.title_en) || s(l.title),
    titleAr: s(l.title),
    file: asset(l.file),
    pages: num(l.pages) ?? 0,
  })),
}));

const videos = inSection("videos").map((v) => ({
  id: v.id,
  titleEn: s(v.title_en) || s(v.title),
  titleAr: s(v.title),
  summaryEn: s(v.summary_en),
  summaryAr: s(v.summary),
  eventEn: s(v.event_en),
  eventAr: s(v.event),
  link: s(v.link),
  image: asset(v.image),
  date: s(v.date),
}));

const reviewItems = inSection("reviews");
const report = reviewItems.find((r) => r.kind === "report");
const systems = reviewItems
  .filter((r) => r.kind !== "report")
  .sort((a, b) => (num(a.num) ?? 0) - (num(b.num) ?? 0))
  .map((r) => ({
    id: r.id,
    num: num(r.num) ?? 0,
    nameEn: s(r.short_en) || s(r.title_en) || s(r.short) || s(r.title),
    nameAr: s(r.short) || s(r.title),
    fullNameEn: s(r.title_en) || s(r.title),
    fullNameAr: s(r.title),
    cats: r.cats ?? [],
    license: s(r.license) || "other",
    link: s(r.link),
    date: s(r.date),
    funcEn: s(r.q_func_en), funcAr: s(r.q_func),
    useEn: s(r.q_use_en), useAr: s(r.q_use),
    perfEn: s(r.q_perf_en), perfAr: s(r.q_perf),
    costEn: s(r.q_cost_en), costAr: s(r.q_cost),
    supportEn: s(r.q_support_en), supportAr: s(r.q_support),
    noteEn: s(r.catNote_en), noteAr: s(r.catNote),
    strengthsEn: s(r.strengths_en), strengthsAr: s(r.strengths),
    highlight: Boolean(r.highlight),
  }));

const systemsReport = report
  ? {
      titleEn: s(report.title_en),
      titleAr: s(report.title),
      summaryEn: s(report.summary_en),
      summaryAr: s(report.summary),
      bodyAr: figures(report.body),
      date: s(report.date),
    }
  : null;

const openLibrary = inSection("openlib")
  .sort((a, b) => (num(a.num) ?? 0) - (num(b.num) ?? 0))
  .map((o) => ({
    id: o.id,
    num: num(o.num) ?? 0,
    groupEn: s(o.group_en),
    groupAr: s(o.group),
    title: s(o.title),
    summaryEn: s(o.summary_en),
    summaryAr: s(o.summary),
    link: s(o.link),
  }));

const gallery = inSection("gallery")
  .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || s(b.date).localeCompare(s(a.date)) || (b.createdAt ?? 0) - (a.createdAt ?? 0))
  .map((g) => ({
    id: g.id,
    type: "image",
    src: asset(g.image),
    titleEn: s(g.title_en) || s(g.title),
    titleAr: s(g.title),
    captionEn: s(g.date),
    captionAr: s(g.date),
  }));

const cv = inSection("cv").sort((a, b) => a.id.localeCompare(b.id)).map((c) => ({
  id: c.id,
  titleEn: s(c.title_en),
  titleAr: s(c.title),
  bodyEn: s(c.body_en),
  bodyAr: s(c.body),
}));

const consultRequests = Object.entries(db)
  .filter(([key]) => /^consult\/[^/]+\/requests\//.test(key))
  .map(([, r]) => ({
    name: s(r.name),
    email: s(r.email),
    phone: s(r.phone),
    organization: s(r.field),
    consultType: s(r.type),
    subject: s(r.subject),
    message: s(r.details) || s(r.other),
    createdAt: new Date(r.createdAt).toISOString(),
  }));

/* ---------- Write ---------- */

const out = {
  importedFrom: "khaled-website-local.zip",
  profile,
  sections,
  books,
  publications,
  articles,
  talks,
  videos,
  systems,
  systemsReport,
  openLibrary,
  gallery,
  cv,
};
writeFileSync(path.join(web, "src", "data", "legacy.json"), JSON.stringify(out, null, 2) + "\n");
// Visitor requests are personal data: kept out of the public bundle and only loaded into the admin inbox.
writeFileSync(path.join(web, "scripts", "legacy-consult-requests.json"), JSON.stringify(consultRequests, null, 2) + "\n");

/*
 * E-books: point figure images (<img data-f="id">) at the copied files and drop anything
 * that could run script, so the reader can render the chapters as-is.
 */
for (const book of books.filter((b) => b.ebook)) {
  const file = path.join(web, "public", book.ebook);
  const ebook = JSON.parse(readFileSync(file, "utf8"));
  for (const [key, html] of Object.entries(ebook.content)) {
    ebook.content[key] = String(html)
      .replace(/<\/?(script|iframe|object|embed|style|link|meta)[^>]*>/gi, "")
      .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/data-f="([0-9a-f]{32})"/g, (_, id) => `src="${asset(id) ?? ""}"`);
  }
  writeFileSync(file, JSON.stringify(ebook));
}

const usedIds = new Set();
JSON.stringify(out).replace(/\/content\/([0-9a-f]{32})\./g, (_, id) => usedIds.add(id));
for (const book of books.filter((b) => b.ebook)) {
  const ebookText = readFileSync(path.join(web, "public", book.ebook), "utf8");
  for (const m of ebookText.matchAll(/\/content\/([0-9a-f]{32})\./g)) usedIds.add(m[1]);
}
const unused = Object.keys(files).filter((id) => !usedIds.has(id));
console.log(
  `Imported: ${books.length} books, ${publications.length} publications, ${articles.length} articles, ` +
    `${talks.length} talks, ${videos.length} videos, ${systems.length} systems, ${openLibrary.length} open resources, ` +
    `${gallery.length} photos, ${cv.length} CV sections, ${consultRequests.length} consult requests.`,
);
console.log(`Assets copied: ${Object.keys(files).length}; not referenced: ${unused.length}${unused.length ? " → " + unused.join(", ") : ""}`);
