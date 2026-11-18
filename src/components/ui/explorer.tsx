"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, RotateCcw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt } from "@/i18n/config";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string> {
  id: T;
  label: string;
  count?: number;
}

/** Compact pill-shaped select used in the filter toolbars. */
export function SelectFilter<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  className?: string;
}) {
  const active = value !== options[0]?.id;
  return (
    <label className={cn("relative block min-w-0 shrink-0", className)}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(
          "h-11 w-full appearance-none truncate rounded-full border bg-background/60 pe-9 ps-4 text-sm font-medium transition-colors duration-300 hover:border-foreground/25 focus:border-primary focus:outline-none",
          active ? "border-primary/50 text-primary" : "border-border",
        )}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id} className="bg-surface text-foreground">
            {o.label}
            {o.count !== undefined ? ` (${o.count})` : ""}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </label>
  );
}

/** "Showing 8 of 27 publications" plus a reset button when any filter is active. */
export function ResultsBar({
  template,
  shown,
  total,
  noun,
  active,
  onReset,
  resetLabel,
  children,
}: {
  template: string;
  shown: number;
  total: number;
  noun: string;
  active: boolean;
  onReset: () => void;
  resetLabel: string;
  children?: React.ReactNode;
}) {
  const text = fmt(template, { shown: String(shown), total: String(total), noun });
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite" aria-atomic="true">
          {text.split(/(\d+)/).map((part, i) =>
            /^\d+$/.test(part) ? (
              <span key={i} className="font-semibold tabular-nums text-foreground">
                {part}
              </span>
            ) : (
              <React.Fragment key={i}>{part}</React.Fragment>
            ),
          )}
        </p>
        <AnimatePresence>
          {active && (
            <motion.button
              type="button"
              onClick={onReset}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              {resetLabel}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      {children}
    </div>
  );
}

export function EmptyResults({
  title,
  hint,
  resetLabel,
  onReset,
  className,
}: {
  title: string;
  hint: string;
  resetLabel: string;
  onReset: () => void;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center gap-3 px-6 py-16 text-center", className)}
    >
      <span className="neu grid size-14 place-items-center rounded-2xl text-muted-foreground">
        <SearchX className="size-6" aria-hidden />
      </span>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{hint}</p>
      <Button variant="outline" size="sm" onClick={onReset} className="mt-1">
        <RotateCcw aria-hidden /> {resetLabel}
      </Button>
    </motion.div>
  );
}
