"use client";

import type { Book, Collaborator, GalleryEntry, Publication } from "@/types";
import { CollectionEditor, newId, type FieldDef } from "./collection-editor";

/* ---------- Books ---------- */

const bookFields: FieldDef<Book>[] = [
  { key: "title", label: "Title (English)", kind: "text", wide: true },
  { key: "titleAr", label: "Title (Arabic)", kind: "text", wide: true, dir: "rtl", nullable: true, help: "Leave empty for English-only books." },
  { key: "publisher", label: "Publisher (English)", kind: "text" },
  { key: "publisherAr", label: "Publisher (Arabic)", kind: "text", dir: "rtl" },
  { key: "year", label: "Year", kind: "number", nullable: true, placeholder: "Leave empty if unknown" },
  {
    key: "language",
    label: "Book language",
    kind: "select",
    options: [
      { value: "ar", label: "Arabic" },
      { value: "en", label: "English" },
    ],
  },
  { key: "cover", label: "Cover image", kind: "upload", accept: "image" },
  { key: "pdf", label: "PDF of the book (optional)", kind: "upload", accept: "pdf", nullable: true, help: "Shows a “Read PDF” button under the book." },
  { key: "url", label: "External link (optional)", kind: "text", nullable: true, dir: "ltr", wide: true, placeholder: "https://…", help: "Publisher or store page. Used when there is no PDF." },
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
        publisher: "",
        publisherAr: "",
        year: new Date().getFullYear(),
        language: "ar",
        cover: "",
        pdf: null,
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
  { key: "title", label: "Title", kind: "textarea", help: "As it appears in the citation." },
  { key: "authors", label: "Authors", kind: "text", wide: true },
  { key: "venue", label: "Venue (journal, conference · volume: pages)", kind: "text", wide: true },
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
];

export function PublicationsEditor({ initial }: { initial: Publication[] }) {
  return (
    <CollectionEditor<Publication>
      section="publications"
      initial={initial}
      fields={publicationFields}
      create={() => ({
        id: newId("pub"),
        title: "",
        authors: "K. A. F. Mohamed",
        venue: "",
        year: new Date().getFullYear(),
        citations: 0,
        category: "retrieval",
      })}
      title={(p) => p.title}
      subtitle={(p) => `${p.year} · ${p.citations} citations · ${p.venue}`}
      searchText={(p) => `${p.title} ${p.authors} ${p.venue} ${p.year}`}
      addLabel="Add publication"
      emptyText="No publications yet."
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
      create={() => ({
        id: newId("media"),
        type: "image",
        src: "",
        titleEn: "",
        titleAr: "",
        captionEn: "",
        captionAr: "",
      })}
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
