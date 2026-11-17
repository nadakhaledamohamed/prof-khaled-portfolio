import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

/** Mirrors a directional icon (arrows, chevrons) in right-to-left layouts. */
export const flipRtl = "rtl:-scale-x-100";

/** Diagonal "external link" nudge on button hover, mirrored for RTL. */
export const arrowNudge =
  "group-hover/btn:-translate-y-0.5 ltr:group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5";

/** Same nudge for links that use a plain `group`. */
export const arrowNudgeGroup =
  "group-hover:-translate-y-0.5 ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5";
