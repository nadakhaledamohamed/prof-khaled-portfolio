"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { saveTextSection } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import { SaveBar, useEditorState } from "./save-bar";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type Path = (string | number)[];

/** New-item templates for lists that ship empty. */
const EMPTY_LIST_TEMPLATES: Record<string, Json> = {
  testimonials: { quote: "", name: "", role: "" },
};

const ICON_OPTIONS = ["search", "library", "globe", "tags", "handshake", "flask"];

/** Fields that should always be multi-line. */
const LONG_KEYS = new Set(["description", "lede", "note", "quote", "paragraphs", "text", "yearsHint"]);

function getAt(root: Json | undefined, path: Path): Json | undefined {
  let node: Json | undefined = root;
  for (const part of path) {
    if (node === null || node === undefined || typeof node !== "object") return undefined;
    node = (node as Record<string | number, Json>)[part as never];
  }
  return node;
}

function setAt(root: Json, path: Path, value: Json): Json {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    const copy = [...root];
    copy[head as number] = setAt(copy[head as number] ?? null, rest, value);
    return copy;
  }
  const obj = (root && typeof root === "object" ? root : {}) as Record<string, Json>;
  return { ...obj, [head]: setAt(obj[head as string] ?? null, rest, value) };
}

/** Copy of a list item with every text emptied, used for "Add". */
function blank(template: Json): Json {
  if (typeof template === "string") return "";
  if (Array.isArray(template)) return [];
  if (template && typeof template === "object") {
    return Object.fromEntries(
      Object.entries(template)
        .filter(([key]) => key !== "featured")
        .map(([key, value]) => [key, blank(value)]),
    );
  }
  return template;
}

function humanize(key: string | number) {
  if (typeof key === "number") return `Item ${key + 1}`;
  const spaced = key
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\bcv\b/i, "CV")
    .toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function hintsFor(key: string, en: string, ar: string) {
  const hints: string[] = [];
  const text = `${en} ${ar}`;
  const placeholders = Array.from(new Set(text.match(/\{\w+\}/g) ?? []));
  if (placeholders.length) hints.push(`Keep ${placeholders.join(", ")} — filled in automatically`);
  if (key === "title" && /\*[^*]+\*/.test(text)) hints.push("*word* = gradient accent");
  if (/\*\*[^*]+\*\*/.test(text)) hints.push("**word** = bold");
  return hints;
}

interface Props {
  section: string;
  label: string;
  initialEn: Json;
  initialAr: Json;
}

export function PairedEditor({ section, label, initialEn, initialAr }: Props) {
  const editor = useEditorState({ en: initialEn, ar: initialAr }, (value) =>
    saveTextSection(section, value.en, value.ar),
  );
  const { en, ar } = editor.value;

  const setString = (lang: "en" | "ar", path: Path, value: string) =>
    editor.setValue((state) => ({ ...state, [lang]: setAt(state[lang], path, value) }));

  /** Shared (non-text) values and list operations apply to both languages. */
  const setBoth = (path: Path, value: Json) =>
    editor.setValue((state) => ({ en: setAt(state.en, path, value), ar: setAt(state.ar, path, value) }));

  const mutateList = (path: Path, op: (list: Json[]) => Json[]) =>
    editor.setValue((state) => ({
      en: setAt(state.en, path, op([...((getAt(state.en, path) as Json[]) ?? [])])),
      ar: setAt(state.ar, path, op([...((getAt(state.ar, path) as Json[]) ?? [])])),
    }));

  function renderNode(path: Path, enNode: Json | undefined, arNode: Json | undefined): React.ReactNode {
    const key = path[path.length - 1] ?? section;
    const keyName = String(typeof key === "number" ? path[path.length - 2] ?? "" : key);
    const sample = enNode ?? arNode;

    // Text: English and Arabic side by side.
    if (typeof sample === "string" || (sample === undefined && (typeof enNode === "string" || typeof arNode === "string"))) {
      const enText = typeof enNode === "string" ? enNode : "";
      const arText = typeof arNode === "string" ? arNode : "";
      const long = LONG_KEYS.has(keyName) || enText.length > 80 || arText.length > 80;
      const id = `f-${path.join("-")}`;
      const hints = hintsFor(String(key), enText, arText);
      return (
        <div key={id} className="grid gap-2">
          <p className="text-sm font-medium">{humanize(key)}</p>
          <div className="grid gap-2 md:grid-cols-2">
            <TextBox id={`${id}-en`} lang="en" value={enText} long={long} onChange={(v) => setString("en", path, v)} />
            <TextBox id={`${id}-ar`} lang="ar" value={arText} long={long} onChange={(v) => setString("ar", path, v)} />
          </div>
          {hints.length > 0 && <p className="text-xs text-muted-foreground">{hints.join(" · ")}</p>}
        </div>
      );
    }

    // Shared primitives.
    if (typeof sample === "boolean") {
      return (
        <label key={path.join("-")} className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={Boolean(sample)}
            onChange={(e) => setBoth(path, e.target.checked)}
            className="size-4 accent-[var(--primary)]"
          />
          {humanize(key)} <span className="text-xs text-muted-foreground">(both languages)</span>
        </label>
      );
    }
    if (typeof sample === "number") {
      return (
        <label key={path.join("-")} className="grid gap-1.5 text-sm">
          <span className="font-medium">{humanize(key)}</span>
          <input
            type="number"
            value={sample}
            onChange={(e) => setBoth(path, Number(e.target.value) || 0)}
            className="h-11 w-40 rounded-2xl border border-border bg-background/60 px-4"
          />
        </label>
      );
    }

    // Lists: items stay aligned between languages.
    if (Array.isArray(sample)) {
      const enList = (Array.isArray(enNode) ? enNode : []) as Json[];
      const arList = (Array.isArray(arNode) ? arNode : []) as Json[];
      const length = Math.max(enList.length, arList.length);
      const template = enList[0] ?? arList[0] ?? EMPTY_LIST_TEMPLATES[String(key)];
      const fixed = keyName === "miniLabels";
      const itemIsText = typeof template === "string";

      return (
        <fieldset key={path.join("-")} className="rounded-2xl border border-border p-4">
          <legend className="px-1.5 text-sm font-semibold">
            {humanize(key)} <span className="font-normal text-muted-foreground">({length})</span>
          </legend>
          <div className="grid gap-4">
            {Array.from({ length }, (_, i) => (
              <div key={i} className={cn("grid gap-3", !itemIsText && "rounded-xl bg-foreground/[0.025] p-3 dark:bg-white/[0.03]")}>
                {!fixed && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">#{i + 1}</span>
                    <div className="flex gap-1">
                      <SmallButton label="Move up" disabled={i === 0} onClick={() => mutateList(path, (l) => { [l[i - 1], l[i]] = [l[i], l[i - 1]]; return l; })}>
                        <ArrowUp className="size-3.5" />
                      </SmallButton>
                      <SmallButton label="Move down" disabled={i === length - 1} onClick={() => mutateList(path, (l) => { [l[i + 1], l[i]] = [l[i], l[i + 1]]; return l; })}>
                        <ArrowDown className="size-3.5" />
                      </SmallButton>
                      <SmallButton
                        label="Remove"
                        danger
                        onClick={() => {
                          if (window.confirm(`Remove item ${i + 1} in both languages?`)) mutateList(path, (l) => l.filter((_, j) => j !== i));
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </SmallButton>
                    </div>
                  </div>
                )}
                {itemIsText
                  ? renderNode([...path, i], enList[i] ?? "", arList[i] ?? "")
                  : renderNode([...path, i], enList[i], arList[i])}
              </div>
            ))}
            {!fixed && template !== undefined && (
              <button
                type="button"
                onClick={() => mutateList(path, (l) => [...l, blank(template)])}
                className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Plus className="size-4" /> Add to both languages
              </button>
            )}
          </div>
        </fieldset>
      );
    }

    // Groups.
    if (sample && typeof sample === "object") {
      const enObj = (enNode && typeof enNode === "object" ? enNode : {}) as Record<string, Json>;
      const arObj = (arNode && typeof arNode === "object" ? arNode : {}) as Record<string, Json>;
      const keys = Array.from(new Set([...Object.keys(enObj), ...Object.keys(arObj)])).filter((k) => k !== "locale");
      const children = keys.map((k) => {
        if (k === "icon") {
          const current = (enObj[k] ?? arObj[k]) as string;
          return (
            <label key={k} className="grid gap-1.5 text-sm">
              <span className="font-medium">Icon</span>
              <select
                value={current}
                onChange={(e) => setBoth([...path, k], e.target.value)}
                className="h-11 w-56 rounded-2xl border border-border bg-background/60 px-4"
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon} className="bg-surface">
                    {icon}
                  </option>
                ))}
              </select>
            </label>
          );
        }
        return renderNode([...path, k], enObj[k], arObj[k]);
      });

      if (path.length === 0 || typeof key === "number") return <div className="grid gap-5">{children}</div>;
      return (
        <fieldset key={path.join("-")} className="grid gap-5 rounded-2xl border border-border p-4">
          <legend className="px-1.5 text-sm font-semibold">{humanize(key)}</legend>
          {children}
        </fieldset>
      );
    }

    return null;
  }

  return (
    <div>
      <div className="mb-5 hidden grid-cols-2 gap-2 md:grid">
        <p className="glass rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">English</p>
        <p className="glass rounded-xl px-4 py-2 text-end text-xs font-semibold text-muted-foreground" lang="ar" dir="rtl">
          العربية
        </p>
      </div>
      <section aria-label={label} className="glass rounded-3xl p-4 sm:p-6">
        {renderNode([], en, ar)}
      </section>
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

function TextBox({
  id,
  lang,
  value,
  long,
  onChange,
}: {
  id: string;
  lang: "en" | "ar";
  value: string;
  long: boolean;
  onChange: (value: string) => void;
}) {
  const className =
    "w-full rounded-2xl border border-border bg-background/60 px-3.5 text-[15px] leading-relaxed transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_14%,transparent)] focus:outline-none";
  const props = {
    id,
    lang,
    dir: lang === "ar" ? ("rtl" as const) : ("ltr" as const),
    "aria-label": lang === "ar" ? "Arabic" : "English",
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    style: lang === "ar" ? { fontFamily: "var(--font-plex-ar), var(--font-inter), sans-serif" } : undefined,
  };
  return (
    <div className="relative">
      <span className="pointer-events-none absolute -top-2 rounded bg-background px-1 font-mono text-[10px] uppercase text-muted-foreground md:hidden ltr:right-3 rtl:left-3">
        {lang}
      </span>
      {long ? (
        <textarea {...props} rows={Math.min(10, Math.max(3, Math.ceil(value.length / 70)))} className={cn(className, "resize-y py-2.5")} />
      ) : (
        <input {...props} className={cn(className, "h-11")} />
      )}
    </div>
  );
}

function SmallButton({
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
        "grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors disabled:pointer-events-none disabled:opacity-30",
        danger ? "hover:bg-destructive/10 hover:text-destructive" : "hover:bg-foreground/5 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
