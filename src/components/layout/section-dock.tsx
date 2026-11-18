"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronUp, ListTree, X } from "lucide-react";
import type { Dictionary } from "@/content/types";
import { sectionIds } from "@/data/site";
import { useActiveSection } from "@/hooks/use-active-section";
import type { Locale } from "@/i18n/config";
import { cn, easeOutExpo } from "@/lib/utils";

type DockId = keyof Dictionary["dock"]["sections"];

/**
 * Floating navigation for the long home page.
 * Desktop: a vertical rail of section dots with labels and previous/next controls.
 * Mobile: a bottom bar with previous/next and a "jump to section" sheet.
 * Hidden while the hero is on screen.
 */
export function SectionDock({ t, locale }: { t: Dictionary["dock"]; locale: Locale }) {
  const reduce = useReducedMotion();
  const [ids, setIds] = React.useState<readonly string[]>(sectionIds);
  const active = useActiveSection(ids);
  const [visible, setVisible] = React.useState(false);
  const [sheet, setSheet] = React.useState(false);
  const rtl = locale === "ar";

  // Only offer sections that are actually on the page (e.g. an empty gallery is hidden).
  React.useEffect(() => {
    setIds(sectionIds.filter((id) => document.getElementById(id)));
  }, []);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sheet]);

  const index = Math.max(0, ids.indexOf(active));
  const label = (id: string) => t.sections[id as DockId] ?? id;

  const go = React.useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      setSheet(false);
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", id === "top" ? window.location.pathname : `#${id}`);
    },
    [reduce],
  );

  const prev = index > 0 ? ids[index - 1] : null;
  const next = index < ids.length - 1 ? ids[index + 1] : null;

  return (
    <>
      {/* Desktop rail */}
      <AnimatePresence>
        {visible && (
          <motion.nav
            aria-label={t.label}
            className="fixed end-4 top-1/2 z-[55] hidden -translate-y-1/2 xl:block"
            initial={{ opacity: 0, x: rtl ? -24 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: rtl ? -24 : 24 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
          >
            <div className="glass flex flex-col items-center gap-1 rounded-full px-1.5 py-2">
              <DockButton label={t.prev} disabled={!prev} onClick={() => prev && go(prev)}>
                <ChevronUp className="size-4" />
              </DockButton>
              <ol className="flex flex-col items-center gap-0.5 py-1">
                {ids.map((id, i) => {
                  const on = i === index;
                  return (
                    <li key={id} className="group relative">
                      <button
                        type="button"
                        onClick={() => go(id)}
                        aria-label={label(id)}
                        aria-current={on ? "location" : undefined}
                        className="grid h-5 w-6 place-items-center"
                      >
                        <span
                          className={cn(
                            "block rounded-full transition-all duration-500",
                            on ? "bg-brand h-4 w-1.5" : "size-1.5 bg-muted-foreground/40 group-hover:scale-150 group-hover:bg-primary",
                          )}
                        />
                      </button>
                      {/* Label on hover / for the active section */}
                      <span
                        className={cn(
                          "pointer-events-none absolute end-full top-1/2 me-3 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium opacity-0 shadow-lg transition-all duration-300",
                          "glass group-hover:opacity-100 group-focus-within:opacity-100",
                          "translate-x-1 group-hover:translate-x-0 rtl:-translate-x-1 rtl:group-hover:translate-x-0",
                        )}
                      >
                        <span className="me-1.5 font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                        {label(id)}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <DockButton label={t.next} disabled={!next} onClick={() => next && go(next)}>
                <ChevronDown className="size-4" />
              </DockButton>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Mobile / tablet bar */}
      <AnimatePresence>
        {visible && (
          <motion.nav
            aria-label={t.label}
            className="fixed bottom-5 left-1/2 z-[55] -translate-x-1/2 xl:hidden"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
          >
            <div className="glass flex items-center gap-1 rounded-full p-1.5 shadow-xl">
              <DockButton label={t.prev} disabled={!prev} onClick={() => prev && go(prev)}>
                <ChevronUp className="size-4" />
              </DockButton>
              <button
                type="button"
                onClick={() => setSheet(true)}
                aria-haspopup="dialog"
                aria-label={t.jump}
                className="flex max-w-[36vw] items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-foreground/5"
              >
                <ListTree className="size-4 shrink-0 text-primary" aria-hidden />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={ids[index]}
                    className="truncate"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    {label(ids[index] ?? "top")}
                  </motion.span>
                </AnimatePresence>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground tabular-nums">
                  {index + 1}/{ids.length}
                </span>
              </button>
              <DockButton label={t.next} disabled={!next} onClick={() => next && go(next)}>
                <ChevronDown className="size-4" />
              </DockButton>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Quick-jump sheet */}
      <AnimatePresence>
        {sheet && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-end bg-black/40 backdrop-blur-sm xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSheet(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t.jump}
              className="max-h-[78vh] w-full overflow-y-auto rounded-t-[2rem] border-t border-border bg-background p-5 pb-8 shadow-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.45, ease: easeOutExpo }}
              onClick={(e) => e.stopPropagation()}
            >
              <div aria-hidden className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-medium">{t.jump}</h2>
                <button type="button" onClick={() => setSheet(false)} aria-label={t.close} className="grid size-9 place-items-center rounded-full border border-border">
                  <X className="size-4" />
                </button>
              </div>
              <ol className="grid grid-cols-2 gap-2">
                {ids.map((id, i) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => go(id)}
                      aria-current={i === index ? "location" : undefined}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-2xl border px-3 py-3 text-start text-sm font-medium transition-colors",
                        i === index ? "border-primary/40 bg-primary/10 text-primary" : "border-border hover:bg-foreground/5",
                      )}
                    >
                      <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      <span className="truncate">{label(id)}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DockButton({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-full text-muted-foreground transition-[color,background-color,transform] duration-300 hover:bg-foreground/5 hover:text-foreground active:scale-90 disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}
