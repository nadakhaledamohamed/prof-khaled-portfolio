"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Search field used above every list. */
export function SearchBox({
  value,
  onChange,
  label,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  className?: string;
}) {
  return (
    <label className={cn("relative block min-w-0", className)}>
      <span className="sr-only">{label}</span>
      <Search aria-hidden className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full min-w-0 rounded-full border border-border bg-background/60 pe-10 ps-11 text-sm backdrop-blur transition-[border-color,box-shadow] duration-300 placeholder:text-muted-foreground/70 hover:border-foreground/25 focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_16%,transparent)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear"
          className="absolute end-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </label>
  );
}

/** Row of toggle chips with an animated active pill. */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
  layoutId,
  className,
}: {
  options: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  layoutId: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className={cn(
              "relative shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors duration-300 active:scale-95",
              selected
                ? "border-transparent text-background"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {selected && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">
              {option.label}
              {option.count !== undefined && (
                <span className={cn("ms-1.5 tabular-nums", selected ? "opacity-70" : "opacity-60")}>{option.count}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Case- and diacritic-insensitive matching for Arabic and English search. */
export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[ً-ٰٟـ]/g, "") // Arabic diacritics and tatweel
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[̀-ͯ]/g, "");
}

export function matches(query: string, ...fields: (string | null | undefined)[]) {
  const q = normalize(query.trim());
  if (!q) return true;
  const haystack = normalize(fields.filter(Boolean).join(" "));
  return q.split(/\s+/).every((word) => haystack.includes(word));
}
