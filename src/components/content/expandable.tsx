"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn, easeOutExpo } from "@/lib/utils";

/**
 * Shows the first part of long content and reveals the rest on demand.
 * Collapsed content stays in the DOM (hidden), so it is still indexed by search engines.
 */
export function Expandable({
  preview,
  rest,
  labels,
  className,
}: {
  preview: React.ReactNode;
  rest: React.ReactNode;
  labels: { more: string; less: string };
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();

  return (
    <div className={className}>
      {preview}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
            className="overflow-hidden"
          >
            {rest}
          </motion.div>
        )}
      </AnimatePresence>
      {!open && <div hidden>{rest}</div>}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="group mt-5 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
      >
        {open ? labels.less : labels.more}
        <ChevronDown className={cn("size-4 transition-transform duration-300", open && "rotate-180")} aria-hidden />
      </button>
    </div>
  );
}
