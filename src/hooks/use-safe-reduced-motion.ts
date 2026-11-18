"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Reduced-motion preference that is `false` during server render and hydration,
 * so the first client render matches the server HTML. The real value applies after mount.
 */
export function useSafeReducedMotion() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted && Boolean(reduce);
}
