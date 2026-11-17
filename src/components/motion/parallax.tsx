"use client";

import * as React from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  /** Total vertical travel in px while the element crosses the viewport. Negative moves up. */
  offset?: number;
}

/** Moves its children at a different speed than the page while scrolling. */
export function Parallax({ children, className, offset = 60 }: ParallaxProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const raw = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const y = useSpring(raw, { stiffness: 120, damping: 28, mass: 0.4 });

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
