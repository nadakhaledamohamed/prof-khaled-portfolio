"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  labels: { toDark: string; toLight: string };
  className?: string;
}

/** Animated light/dark switch. The choice is persisted to localStorage by next-themes. */
export function ThemeToggle({ labels, className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      role="switch"
      // Keep the sun on the left and the moon on the right in both languages.
      dir="ltr"
      aria-checked={isDark}
      aria-label={isDark ? labels.toLight : labels.toDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "neu-inset relative flex h-9 w-[4.25rem] shrink-0 items-center rounded-full px-1 transition-transform duration-300 active:scale-95",
        isDark ? "justify-end" : "justify-start",
        className,
      )}
    >
      <Sun aria-hidden className="absolute left-2.5 size-3.5 text-muted-foreground/60" />
      <Moon aria-hidden className="absolute right-2.5 size-3.5 text-muted-foreground/60" />
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 520, damping: 32 }}
        className="bg-brand relative z-10 grid size-7 place-items-center overflow-hidden rounded-full text-white shadow-md dark:text-[#070a12]"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="grid place-items-center"
          >
            {isDark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </button>
  );
}
