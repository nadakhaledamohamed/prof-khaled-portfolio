"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { monogram } from "@/data/site";
import { introSeen, markIntroSeen } from "@/hooks/use-intro";
import { easeOutExpo } from "@/lib/utils";

const DURATION_MS = 1500;
/** On later page loads in the same session the loader only wipes away, acting as a page transition. */
const REPEAT_MS = 200;

interface LoadingScreenProps {
  label: string;
  tagline: string;
}

/** Branded intro shown in full once per browser session, then wiped away. */
export function LoadingScreen({ label, tagline }: LoadingScreenProps) {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = introSeen();
    markIntroSeen();
    const timer = window.setTimeout(
      () => setLoading(false),
      reduced ? 0 : seen ? REPEAT_MS : DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    document.documentElement.style.overflow = loading ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [loading]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader"
          role="status"
          aria-label={label}
          className="fixed inset-0 z-[200] grid place-items-center bg-background"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 0.9, ease: easeOutExpo }}
        >
          <div className="flex flex-col items-center gap-7">
            <motion.div
              className="font-display text-7xl font-medium tracking-tight sm:text-8xl"
              initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.8, ease: easeOutExpo }}
            >
              <span className="text-gradient">{monogram}</span>
            </motion.div>
            <div className="h-px w-44 overflow-hidden rounded-full bg-border">
              <motion.div
                className="bg-brand h-full origin-left rtl:origin-right"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: DURATION_MS / 1000 - 0.15, ease: "easeInOut" }}
              />
            </div>
            <motion.p
              className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              {tagline}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
