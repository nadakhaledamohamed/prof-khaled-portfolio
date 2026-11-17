"use client";

import * as React from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { easeOutExpo } from "@/lib/utils";

interface CounterProps {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

/**
 * Counts up to `value` the first time it scrolls into view.
 * The final value is server-rendered, so it is correct without JavaScript.
 */
export function Counter({ value, suffix = "", duration = 1.8, className }: CounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    const node = ref.current;
    if (!inView || !node || reduceMotion) return;
    const controls = animate(0, value, {
      duration,
      ease: easeOutExpo,
      onUpdate: (latest) => {
        node.textContent = Math.round(latest).toString();
      },
    });
    return () => controls.stop();
  }, [inView, value, duration, reduceMotion]);

  return (
    <span className={className}>
      <span ref={ref} className="tabular-nums">
        {value}
      </span>
      {suffix}
    </span>
  );
}
