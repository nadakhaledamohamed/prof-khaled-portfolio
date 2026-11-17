"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Thin reading-progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  return (
    <motion.div
      aria-hidden
      className="bg-brand fixed inset-x-0 top-0 z-[80] h-0.5 origin-left rtl:origin-right"
      style={{ scaleX }}
    />
  );
}
