"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, ChevronDown, FileText, Plus, Search, Trash2 } from "lucide-react";
import { saveDataSection } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { SaveBar, useEditorState } from "./save-bar";
import { UploadField } from "./upload-field";

export interface FieldDef<T> {
  key: keyof T & string;
  label: string;
  kind: "text" | "textarea" | "longtext" | "number" | "select" | "upload" | "checkbox" | "multiselect" | "lectures";
  options?: { value: string; label: string }[];
  accept?: "image" | "pdf" | "any";
  /** Empty input is stored as null. */
  nullable?: boolean;
  dir?: "ltr" | "rtl";
  wide?: boolean;
  help?: string;
  placeholder?: string;
}

interface CollectionEditorProps<T extends { id: string }> {
  section:
    | "books"
    | "publications"
    | "collaborators"
    | "gallery"
    | "articles"
    | "talks"
    | "videos"
    | "systems"
    | "openLibrary"
    | "cv";
  initial: T[];
  fields: FieldDef<T>[];
  create: () => T;
  title: (item: T) => string;
  subtitle?: (item: T) => string;
  thumb?: (item: T) => string | null;
  searchText?: (item: T) => string;
  addLabel: string;
  emptyText: string;
}

export function newId(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}

/** List editor for one data collection: add, edit, reorder, delete, then save all at once. */
export function CollectionEditor<T extends { id: string }>({
  section,
  initial,
  fields,
  create,
  title,
  subtitle,
  thumb,
  searchText,
  addLabel,
  emptyText,
}: CollectionEditorProps<T>) {
  const editor = useEditorState<T[]>(initial, (items) => saveDataSection(section, items));
  const items = editor.value;
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");

  const update = (id: string, patch: Partial<T>) =>
    editor.setValue((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const move = (index: number, delta: number) =>
    editor.setValue((list) => {
      const next = [...list];
      const target = index + delta;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const remove = (item: T) => {
    if (!window.confirm(`Remove "${title(item) || "this item"}"? You can still discard before saving.`)) return;
    editor.setValue((list) => list.filter((x) => x.id !== item.id));
  };

  const add = () => {
    const item = create();
    editor.setValue((list) => [item, ...list]);
    setOpenId(item.id);
    setQuery("");
  };

  const q = query.trim().toLowerCase();
  const visible = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !q || (searchText ?? title)(item).toLowerCase().includes(q));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button variant="brand" onClick={add}>
          <Plus /> {addLabel}
        </Button>
        {items.length > 6 && (
          <label className="relative min-w-48 flex-1 sm:max-w-xs">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="h-11 ps-10" />
          </label>
        )}
        <p className="ms-auto text-sm text-muted-foreground">{items.length} items · order here is the order on the site</p>
      </div>

      {items.length === 0 ? (
        <p className="glass rounded-2xl p-6 text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="grid gap-2.5">
          {visible.map(({ item, index }) => {
            const open = openId === item.id;
            const image = thumb?.(item) ?? null;
            return (
              <li key={item.id} className={cn("glass overflow-hidden rounded-2xl transition-colors", open && "border-primary/40")}>
                <div className="flex items-center gap-3 p-3 sm:p-4">
                  {thumb && (
                    <div className="relative grid h-14 w-11 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted">
                      {image && /\.(jpe?g|png|webp|gif|avif)$/i.test(image) ? (
                        <Image src={image} alt="" fill sizes="44px" unoptimized className="object-cover" />
                      ) : (
                        <FileText className="size-4 text-muted-foreground" aria-hidden />
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : item.id)}
                    aria-expanded={open}
                    className="min-w-0 flex-1 text-start"
                  >
                    <span className="block truncate font-medium">{title(item) || <em className="text-muted-foreground">Untitled</em>}</span>
                    {subtitle && <span className="block truncate text-xs text-muted-foreground">{subtitle(item)}</span>}
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <IconButton label="Move up" onClick={() => move(index, -1)} disabled={index === 0 || Boolean(q)}>
                      <ArrowUp className="size-4" />
                    </IconButton>
                    <IconButton label="Move down" onClick={() => move(index, 1)} disabled={index === items.length - 1 || Boolean(q)}>
                      <ArrowDown className="size-4" />
                    </IconButton>
                    <IconButton label="Remove" onClick={() => remove(item)} danger>
                      <Trash2 className="size-4" />
                    </IconButton>
                    <IconButton label={open ? "Collapse" : "Edit"} onClick={() => setOpenId(open ? null : item.id)}>
                      <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
                    </IconButton>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-4 border-t border-border p-4 sm:grid-cols-2 sm:p-5">
                        {fields.map((field) => (
                          <FieldInput
                            key={field.key}
                            id={`${item.id}-${field.key}`}
                            field={field}
                            value={item[field.key]}
                            onChange={(value) => update(item.id, { [field.key]: value } as Partial<T>)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      )}

      <SaveBar
        dirty={editor.dirty}
        pending={editor.pending}
        result={editor.result}
        onSave={editor.submit}
        onDiscard={editor.discard}
      />
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors disabled:pointer-events-none disabled:opacity-30",
        danger ? "hover:bg-destructive/10 hover:text-destructive" : "hover:bg-foreground/5 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function FieldInput<T>({
  id,
  field,
  value,
  onChange,
}: {
  id: string;
  field: FieldDef<T>;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const wide = field.wide || ["textarea", "longtext", "upload", "multiselect", "lectures"].includes(field.kind);
  const common = {
    id,
    dir: field.dir,
    lang: field.dir === "rtl" ? "ar" : undefined,
    placeholder: field.placeholder,
  };

  let control: React.ReactNode;
  switch (field.kind) {
    case "longtext":
      control = (
        <Textarea {...common} className="min-h-72 font-mono text-[13px] leading-relaxed" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      );
      break;
    case "checkbox":
      return (
        <label className={cn("flex items-center gap-2.5 self-end pb-3 text-sm font-medium", wide && "sm:col-span-2")}>
          <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[var(--primary)]" />
          {field.label}
        </label>
      );
    case "multiselect": {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      control = (
        <div className="flex flex-wrap gap-2" role="group" aria-label={field.label}>
          {field.options?.map((option) => {
            const on = selected.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={on}
                onClick={() => onChange(on ? selected.filter((v) => v !== option.value) : [...selected, option.value])}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  on ? "border-transparent bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      );
      break;
    }
    case "lectures":
      control = <LecturesInput id={id} value={(value as Lecture[]) ?? []} onChange={onChange} />;
      break;
    case "textarea":
      control = (
        <Textarea {...common} className="min-h-24" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      );
      break;
    case "number":
      control = (
        <Input
          {...common}
          type="number"
          inputMode="numeric"
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") onChange(field.nullable ? null : 0);
            else onChange(Number.parseInt(raw, 10));
          }}
        />
      );
      break;
    case "select":
      control = (
        <select
          id={id}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full rounded-2xl border border-border bg-background/60 px-4 text-[15px] focus:border-primary focus:outline-none"
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value} className="bg-surface">
              {option.label}
            </option>
          ))}
        </select>
      );
      break;
    case "upload":
      control = (
        <UploadField
          id={id}
          value={(value as string | null) ?? null}
          onChange={(v) => onChange(field.nullable ? v : (v ?? ""))}
          accept={field.accept ?? "any"}
          clearable={field.nullable}
          placeholder={field.placeholder}
        />
      );
      break;
    default:
      control = (
        <Input
          {...common}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(field.nullable && e.target.value === "" ? null : e.target.value)}
        />
      );
  }

  return (
    <div className={cn(wide && "sm:col-span-2")}>
      <Label htmlFor={id}>{field.label}</Label>
      {control}
      {field.help && <p className="mt-1.5 text-xs text-muted-foreground">{field.help}</p>}
    </div>
  );
}

interface Lecture {
  titleEn: string;
  titleAr: string;
  file: string | null;
  pages: number;
}

/** Nested list of lectures / slide decks for a course or talk. */
function LecturesInput({ id, value, onChange }: { id: string; value: Lecture[]; onChange: (value: unknown) => void }) {
  const set = (index: number, patch: Partial<Lecture>) => onChange(value.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  const move = (index: number, delta: number) => {
    const next = [...value];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  return (
    <div id={id} className="grid gap-3">
      {value.map((lecture, i) => (
        <div key={i} className="grid gap-3 rounded-2xl border border-border p-3 sm:grid-cols-2">
          <div className="flex items-center justify-between sm:col-span-2">
            <span className="font-mono text-xs text-muted-foreground">#{i + 1}</span>
            <div className="flex gap-1">
              <IconButton label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                <ArrowUp className="size-4" />
              </IconButton>
              <IconButton label="Move down" onClick={() => move(i, 1)} disabled={i === value.length - 1}>
                <ArrowDown className="size-4" />
              </IconButton>
              <IconButton label="Remove" danger onClick={() => onChange(value.filter((_, j) => j !== i))}>
                <Trash2 className="size-4" />
              </IconButton>
            </div>
          </div>
          <Input aria-label="Title (English)" placeholder="Title (English)" value={lecture.titleEn} onChange={(e) => set(i, { titleEn: e.target.value })} />
          <Input aria-label="Title (Arabic)" placeholder="العنوان بالعربية" dir="rtl" lang="ar" value={lecture.titleAr} onChange={(e) => set(i, { titleAr: e.target.value })} />
          <div className="sm:col-span-2">
            <UploadField id={`${id}-file-${i}`} value={lecture.file} onChange={(file) => set(i, { file })} accept="pdf" clearable />
          </div>
          <Input
            aria-label="Pages"
            type="number"
            min={0}
            placeholder="Pages"
            value={String(lecture.pages || "")}
            onChange={(e) => set(i, { pages: Number.parseInt(e.target.value, 10) || 0 })}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { titleEn: "", titleAr: "", file: null, pages: 0 }])}
        className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-primary"
      >
        <Plus className="size-4" /> Add lecture / slides
      </button>
    </div>
  );
}
