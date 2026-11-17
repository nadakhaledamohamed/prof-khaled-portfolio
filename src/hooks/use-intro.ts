"use client";

import * as React from "react";

const INTRO_KEY = "km-intro-seen";
export const INTRO_DELAY = 1.55;
/** Shorter delay used once the full intro has played in this browser session. */
export const REPEAT_DELAY = 0.35;

export function introSeen() {
  try {
    return window.sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen() {
  try {
    window.sessionStorage.setItem(INTRO_KEY, "1");
  } catch {
    /* storage unavailable (private mode) — the intro simply plays again */
  }
}

/**
 * Seconds to wait before entrance animations start, so they begin as the loading screen clears.
 * Read once on mount; the loading screen marks the intro as seen only after this runs.
 */
export function useIntroDelay() {
  const [delay] = React.useState(() =>
    typeof window !== "undefined" && introSeen() ? REPEAT_DELAY : INTRO_DELAY,
  );
  return delay;
}
