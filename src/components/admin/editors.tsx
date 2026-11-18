"use client";

import type {
  Article,
  Book,
  Collaborator,
  CvSection,
  GalleryEntry,
  OpenResource,
  Publication,
  SystemReview,
  Talk,
  Video,
} from "@/types";
import { CollectionEditor, newId, type FieldDef } from "./collection-editor";

const thisYear = () => new Date().getFullYear();
const today = () => new Date().toISOString().slice(0, 10);

/* ---------- Books ---------- */

const bookFields: FieldDef<Book>[] = [
  { key: "title", label: "Title (English)", kind: "text", wide: true },
  { key: "titleAr", label: "Title (Arabic)", kind: "text", wide: true, dir: "rtl", nullable: true, help: "Leave empty for English-only books." },
  { key: "authorsEn", label: "Authors (English)", kind: "text" },
  { key: "authorsAr", label: "Authors (Arabic)", kind: "text", dir: "rtl" },
  { key: "publisher", label: "Publisher (English)", kind: "text" },
  { key: "publisherAr", label: "Publisher (Arabic)", kind: "text", dir: "rtl" },
  { key: "year", label: "Year", kind: "number", nullable: true, placeholder: "Leave empty if unknown" },
  { key: "isbn", label: "ISBN", kind: "text", dir: "ltr" },
  {
    key: "language",
    label: "Book language",
    kind: "select",
    options: [
      { value: "ar", label: "Arabic" },
      { value: "en", label: "English" },
    ],
  },
  { key: "citations", label: "Citations (optional)", kind: "number", nullable: true },
  { key: "summaryEn", label: "Summary (English)", kind: "textarea" },
  { key: "summaryAr", label: "Summary (Arabic)", kind: "textarea", dir: "rtl" },
  { key: "cover", label: "Cover image", kind: "upload", accept: "image" },
  { key: "pdf", label: "Full PDF (optional)", kind: "upload", accept: "pdf", nullable: true, help: "Shown in a reader on the book page." },
  { key: "toc", label: "PDF table of contents", kind: "longtext", dir: "rtl", help: "One line per entry: “Title | page”. Start with “-” or “--” for sub-sections." },
  { key: "tocOffset", label: "PDF page offset", kind: "number", help: "PDF page = printed page + offset (e.g. 0, or 12 if the PDF has 12 front pages)." },
  { key: "ebook", label: "Full-text e-book file (optional)", kind: "upload", accept: "any", nullable: true, help: "The JSON e-book imported from the previous site." },
  { key: "url", label: "External link (optional)", kind: "text", nullable: true, dir: "ltr", wide: true, placeholder: "https://…" },
];

export function BooksEditor({ initial }: { initial: Book[] }) {
  return (
    <CollectionEditor<Book>
      section="books"
      initial={initial}
      fields={bookFields}
      create={() => ({
        id: newId("book"),
        title: "",
        titleAr: null,
        authorsEn: "Prof. Khaled Abdelfattah Mohamed",
        authorsAr: "أ.د. خالد عبد الفتاح محمد",
        publisher: "",
        publisherAr: "",
        year: thisYear(),
        language: "ar",
        cover: "",
        isbn: "",
        summaryEn: "",
        summaryAr: "",
        citations: null,
        pdf: null,
        ebook: null,
        toc: "",
        tocOffset: 0,
        url: null,
      })}
      title={(b) => b.title}
      subtitle={(b) => [b.titleAr, b.year].filter(Boolean).join(" · ")}
      thumb={(b) => b.cover || null}
      searchText={(b) => `${b.title} ${b.titleAr ?? ""} ${b.publisher}`}
      addLabel="Add book"
      emptyText="No books yet."
    />
  );
}

/* ---------- Publications ---------- */

const publicationFields: FieldDef<Publication>[] = [
  { key: "title", label: "Title (English)", kind: "textarea" },
  { key: "titleAr", label: "Title (Arabic)", kind: "textarea", dir: "rtl" },
  { key: "authors", label: "Authors (English)", kind: "text" },
  { key: "authorsAr", label: "Authors (Arabic)", kind: "text", dir: "rtl" },
  { key: "venue", label: "Venue (English)", kind: "text" },
  { key: "venueAr", label: "Venue (Arabic)", kind: "text", dir: "rtl" },
  { key: "year", label: "Year", kind: "number" },
  { key: "citations", label: "Citations", kind: "number" },
  {
    key: "category",
    label: "Theme",
    kind: "select",
    options: [
      { value: "retrieval", label: "Retrieval & Search" },
      { value: "libraries", label: "Digital Libraries" },
      { value: "other", label: "Interdisciplinary" },
    ],
  },
  {
    key: "kind",
    label: "Type",
    kind: "select",
    options: [
      { value: "paper", label: "Research paper" },
      { value: "study", label: "Study / report" },
    ],
  },
  { key: "link", label: "Link (optional)", kind: "text", dir: "ltr", nullable: true, placeholder: "https://…" },
  { key: "ident", label: "Identifier (ISBN, DOI…)", kind: "text", dir: "ltr" },
  { key: "abstractAr", label: "Full text or abstract (Arabic, optional)", kind: "longtext", dir: "rtl", help: "When filled, the publication gets its own page. “## ” starts a heading, “- ” a bullet." },
];

export function PublicationsEditor({ initial }: { initial: Publication[] }) {
  return (
    <CollectionEditor<Publication>
      section="publications"
      initial={initial}
      fields={publicationFields}
      create={() => ({
        id: newId("pub"),
        kind: "paper",
        title: "",
        titleAr: "",
        authors: "Khaled Abdelfattah Mohamed",
        authorsAr: "خالد عبد الفتاح محمد",
        venue: "",
        venueAr: "",
        year: thisYear(),
        citations: 0,
        category: "retrieval",
        link: null,
        ident: "",
        abstractAr: "",
      })}
      title={(p) => p.title}
      subtitle={(p) => `${p.year} · ${p.citations} citations · ${p.venue}`}
      searchText={(p) => `${p.title} ${p.titleAr} ${p.authors} ${p.venue} ${p.year}`}
      addLabel="Add publication"
      emptyText="No publications yet."
    />
  );
}

/* ---------- Articles ---------- */

const articleFields: FieldDef<Article>[] = [
  { key: "titleAr", label: "Title (Arabic)", kind: "text", dir: "rtl", wide: true },
  { key: "titleEn", label: "Title (English)", kind: "text", wide: true },
  { key: "summaryAr", label: "Summary (Arabic)", kind: "textarea", dir: "rtl" },
  { key: "summaryEn", label: "Summary (English)", kind: "textarea" },
  { key: "date", label: "Date (YYYY-MM-DD)", kind: "text", dir: "ltr", placeholder: "2026-10-19" },
  { key: "link", label: "Original link (optional)", kind: "text", dir: "ltr", nullable: true, placeholder: "https://…" },
  { key: "venueEn", label: "Published in (English)", kind: "text" },
  { key: "venueAr", label: "Published in (Arabic)", kind: "text", dir: "rtl" },
  { key: "image", label: "Cover image (optional)", kind: "upload", accept: "image", nullable: true },
  {
    key: "bodyAr",
    label: "Article text (Arabic)",
    kind: "longtext",
    dir: "rtl",
    help: "“## ” heading · “- ” bullet · “1. ” numbered · [[img:/content/…jpg]] or an uploaded image link on its own line for a figure.",
  },
];

export function ArticlesEditor({ initial }: { initial: Article[] }) {
  return (
    <CollectionEditor<Article>
      section="articles"
      initial={initial}
      fields={articleFields}
      create={() => ({ id: newId("art"), titleEn: "", titleAr: "", summaryEn: "", summaryAr: "", bodyAr: "", date: today(), image: null, link: null, venueEn: "", venueAr: "" })}
      title={(a) => a.titleAr || a.titleEn}
      subtitle={(a) => [a.date, a.titleEn].filter(Boolean).join(" · ")}
      thumb={(a) => a.image}
      searchText={(a) => `${a.titleAr} ${a.titleEn} ${a.summaryEn}`}
      addLabel="Add article"
      emptyText="No articles yet."
    />
  );
}

/* ---------- Courses & talks ---------- */

const talkFields: FieldDef<Talk>[] = [
  {
    key: "track",
    label: "Type",
    kind: "select",
    options: [
      { value: "course", label: "Course" },
      { value: "talk", label: "Talk / presentation" },
    ],
  },
  { key: "image", label: "Cover image", kind: "upload", accept: "image", nullable: true },
  { key: "titleAr", label: "Title (Arabic)", kind: "text", dir: "rtl" },
  { key: "titleEn", label: "Title (English)", kind: "text" },
  { key: "eventAr", label: "Event / course level (Arabic)", kind: "text", dir: "rtl" },
  { key: "eventEn", label: "Event / course level (English)", kind: "text" },
  { key: "placeAr", label: "Place (Arabic, optional)", kind: "text", dir: "rtl" },
  { key: "placeEn", label: "Place (English, optional)", kind: "text" },
  { key: "summaryAr", label: "Summary (Arabic)", kind: "textarea", dir: "rtl" },
  { key: "summaryEn", label: "Summary (English)", kind: "textarea" },
  { key: "lectures", label: "Lectures / slide decks", kind: "lectures" },
  { key: "outlineAr", label: "Course outline (Arabic, optional)", kind: "longtext", dir: "rtl", help: "One lecture per line, e.g. “1. …”." },
];

export function TalksEditor({ initial }: { initial: Talk[] }) {
  return (
    <CollectionEditor<Talk>
      section="talks"
      initial={initial}
      fields={talkFields}
      create={() => ({
        id: newId("talk"),
        track: "talk",
        titleEn: "",
        titleAr: "",
        summaryEn: "",
        summaryAr: "",
        eventEn: "",
        eventAr: "",
        placeEn: "",
        placeAr: "",
        outlineAr: "",
        image: null,
        lectures: [],
      })}
      title={(t) => t.titleAr || t.titleEn}
      subtitle={(t) => `${t.track === "course" ? "Course" : "Talk"} · ${t.lectures.length} PDF · ${t.eventEn}`}
      thumb={(t) => t.image}
      searchText={(t) => `${t.titleAr} ${t.titleEn} ${t.eventEn}`}
      addLabel="Add course or talk"
      emptyText="No courses or talks yet."
    />
  );
}

/* ---------- Videos ---------- */

const videoFields: FieldDef<Video>[] = [
  { key: "link", label: "Video link (YouTube plays on the site; other links open externally)", kind: "text", dir: "ltr", wide: true, placeholder: "https://www.youtube.com/watch?v=…" },
  { key: "image", label: "Thumbnail", kind: "upload", accept: "image", nullable: true },
  { key: "titleAr", label: "Title (Arabic)", kind: "text", dir: "rtl" },
  { key: "titleEn", label: "Title (English)", kind: "text" },
  { key: "summaryAr", label: "Description (Arabic)", kind: "textarea", dir: "rtl" },
  { key: "summaryEn", label: "Description (English)", kind: "textarea" },
  { key: "eventAr", label: "Event / channel (Arabic)", kind: "text", dir: "rtl" },
  { key: "eventEn", label: "Event / channel (English)", kind: "text" },
  { key: "date", label: "Date (optional)", kind: "text", dir: "ltr", placeholder: "2026-10-19" },
];

export function VideosEditor({ initial }: { initial: Video[] }) {
  return (
    <CollectionEditor<Video>
      section="videos"
      initial={initial}
      fields={videoFields}
      create={() => ({ id: newId("vid"), titleEn: "", titleAr: "", summaryEn: "", summaryAr: "", eventEn: "", eventAr: "", link: "", image: null, date: "" })}
      title={(v) => v.titleAr || v.titleEn}
      subtitle={(v) => v.titleEn}
      thumb={(v) => v.image}
      searchText={(v) => `${v.titleAr} ${v.titleEn}`}
      addLabel="Add video"
      emptyText="No videos yet."
    />
  );
}

/* ---------- System reviews ---------- */

const systemFields: FieldDef<SystemReview>[] = [
  { key: "num", label: "Number", kind: "number" },
  { key: "highlight", label: "Featured", kind: "checkbox" },
  { key: "nameEn", label: "Name (English)", kind: "text" },
  { key: "nameAr", label: "Name (Arabic)", kind: "text", dir: "rtl" },
  { key: "fullNameEn", label: "Full name (English)", kind: "text" },
  { key: "fullNameAr", label: "Full name (Arabic)", kind: "text", dir: "rtl" },
  {
    key: "cats",
    label: "Categories",
    kind: "multiselect",
    options: [
      { value: "ils", label: "Library management systems" },
      { value: "repo", label: "Repositories & digital libraries" },
      { value: "access", label: "Knowledge access platforms" },
    ],
  },
  {
    key: "license",
    label: "Licence",
    kind: "select",
    options: [
      { value: "open", label: "Open source" },
      { value: "commercial", label: "Commercial" },
      { value: "platform", label: "Platform" },
      { value: "other", label: "Other" },
    ],
  },
  { key: "link", label: "Website", kind: "text", dir: "ltr", placeholder: "https://…" },
  { key: "funcEn", label: "Functionality (English)", kind: "textarea" },
  { key: "funcAr", label: "Functionality (Arabic)", kind: "textarea", dir: "rtl" },
  { key: "useEn", label: "Ease of use (English)", kind: "textarea" },
  { key: "useAr", label: "Ease of use (Arabic)", kind: "textarea", dir: "rtl" },
  { key: "perfEn", label: "Performance (English)", kind: "textarea" },
  { key: "perfAr", label: "Performance (Arabic)", kind: "textarea", dir: "rtl" },
  { key: "costEn", label: "Cost (English)", kind: "textarea" },
  { key: "costAr", label: "Cost (Arabic)", kind: "textarea", dir: "rtl" },
  { key: "supportEn", label: "Support (English)", kind: "textarea" },
  { key: "supportAr", label: "Support (Arabic)", kind: "textarea", dir: "rtl" },
  { key: "noteEn", label: "Category note (English, optional)", kind: "textarea" },
  { key: "noteAr", label: "Category note (Arabic, optional)", kind: "textarea", dir: "rtl" },
];

export function SystemsEditor({ initial }: { initial: SystemReview[] }) {
  return (
    <CollectionEditor<SystemReview>
      section="systems"
      initial={initial}
      fields={systemFields}
      create={() => ({
        id: newId("sys"),
        num: initial.length + 1,
        nameEn: "",
        nameAr: "",
        fullNameEn: "",
        fullNameAr: "",
        cats: [],
        license: "open",
        link: "",
        date: today(),
        funcEn: "",
        funcAr: "",
        useEn: "",
        useAr: "",
        perfEn: "",
        perfAr: "",
        costEn: "",
        costAr: "",
        supportEn: "",
        supportAr: "",
        noteEn: "",
        noteAr: "",
        strengthsEn: "",
        strengthsAr: "",
        highlight: false,
      })}
      title={(x) => `${x.num}. ${x.nameEn}`}
      subtitle={(x) => `${x.license} · ${x.cats.join(", ")}`}
      searchText={(x) => `${x.nameEn} ${x.nameAr} ${x.fullNameEn}`}
      addLabel="Add system"
      emptyText="No systems yet."
    />
  );
}

/* ---------- Open repositories ---------- */

const openFields: FieldDef<OpenResource>[] = [
  { key: "title", label: "Name", kind: "text" },
  { key: "num", label: "Number", kind: "number" },
  { key: "link", label: "Website", kind: "text", dir: "ltr", wide: true, placeholder: "https://…" },
  { key: "groupEn", label: "Group (English)", kind: "text", help: "Resources with the same group are listed together." },
  { key: "groupAr", label: "Group (Arabic)", kind: "text", dir: "rtl" },
  { key: "summaryEn", label: "Description (English)", kind: "textarea" },
  { key: "summaryAr", label: "Description (Arabic)", kind: "textarea", dir: "rtl" },
];

export function OpenLibraryEditor({ initial }: { initial: OpenResource[] }) {
  return (
    <CollectionEditor<OpenResource>
      section="openLibrary"
      initial={initial}
      fields={openFields}
      create={() => ({ id: newId("ol"), num: initial.length + 1, groupEn: initial[0]?.groupEn ?? "", groupAr: initial[0]?.groupAr ?? "", title: "", summaryEn: "", summaryAr: "", link: "" })}
      title={(r) => r.title}
      subtitle={(r) => `${r.groupEn} · ${r.link}`}
      searchText={(r) => `${r.title} ${r.groupEn} ${r.summaryEn}`}
      addLabel="Add resource"
      emptyText="No resources yet."
    />
  );
}

/* ---------- CV ---------- */

const cvFields: FieldDef<CvSection>[] = [
  { key: "titleEn", label: "Section title (English)", kind: "text" },
  { key: "titleAr", label: "Section title (Arabic)", kind: "text", dir: "rtl" },
  { key: "bodyEn", label: "Content (English)", kind: "longtext", help: "“• ” or “- ” starts a bullet; a line ending with “:” becomes a small heading." },
  { key: "bodyAr", label: "Content (Arabic)", kind: "longtext", dir: "rtl" },
];

export function CvEditor({ initial }: { initial: CvSection[] }) {
  return (
    <CollectionEditor<CvSection>
      section="cv"
      initial={initial}
      fields={cvFields}
      create={() => ({ id: newId("cv"), titleEn: "", titleAr: "", bodyEn: "", bodyAr: "" })}
      title={(c) => c.titleEn}
      subtitle={(c) => c.titleAr}
      addLabel="Add CV section"
      emptyText="No CV sections yet."
    />
  );
}

/* ---------- Gallery ---------- */

const galleryFields: FieldDef<GalleryEntry>[] = [
  {
    key: "type",
    label: "Type",
    kind: "select",
    options: [
      { value: "image", label: "Image (opens in the viewer)" },
      { value: "pdf", label: "PDF document (opens in a new tab)" },
    ],
  },
  { key: "src", label: "File", kind: "upload", accept: "any" },
  { key: "titleEn", label: "Title (English)", kind: "text" },
  { key: "titleAr", label: "Title (Arabic)", kind: "text", dir: "rtl" },
  { key: "captionEn", label: "Caption (English)", kind: "text" },
  { key: "captionAr", label: "Caption (Arabic)", kind: "text", dir: "rtl" },
];

export function GalleryEditor({ initial }: { initial: GalleryEntry[] }) {
  return (
    <CollectionEditor<GalleryEntry>
      section="gallery"
      initial={initial}
      fields={galleryFields}
      create={() => ({ id: newId("media"), type: "image", src: "", titleEn: "", titleAr: "", captionEn: "", captionAr: "" })}
      title={(g) => g.titleEn}
      subtitle={(g) => `${g.type === "pdf" ? "PDF" : "Image"} · ${g.titleAr}`}
      thumb={(g) => g.src || null}
      searchText={(g) => `${g.titleEn} ${g.titleAr} ${g.captionEn}`}
      addLabel="Add item"
      emptyText="The gallery is empty. Its section is hidden until you add items."
    />
  );
}

/* ---------- Collaborators ---------- */

const collaboratorFields: FieldDef<Collaborator>[] = [
  { key: "name", label: "Name", kind: "text", wide: true },
  { key: "affiliationEn", label: "Affiliation (English)", kind: "text" },
  { key: "affiliationAr", label: "Affiliation (Arabic)", kind: "text", dir: "rtl" },
];

export function CollaboratorsEditor({ initial }: { initial: Collaborator[] }) {
  return (
    <CollectionEditor<Collaborator>
      section="collaborators"
      initial={initial}
      fields={collaboratorFields}
      create={() => ({ id: newId("person"), name: "", affiliationEn: "", affiliationAr: "" })}
      title={(c) => c.name}
      subtitle={(c) => `${c.affiliationEn} · ${c.affiliationAr}`}
      addLabel="Add collaborator"
      emptyText="No collaborators yet."
    />
  );
}
