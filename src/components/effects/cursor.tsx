"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const INTERACTIVE = "a, button, [role='button'], [role='tab'], input, textarea, select, [data-cursor]";

/**
 * Desktop-only pointer effects: a large soft glow that trails the mouse and a
 * small ring that grows over interactive elements. Disabled on touch devices
 * and for visitors who prefer reduced motion.
 */
export function Cursor() {
  const [enabled, setEnabled] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const glowX = useSpring(x, { stiffness: 60, damping: 20, mass: 0.6 });
  const glowY = useSpring(y, { stiffness: 60, damping: 20, mass: 0.6 });
  const ringX = useSpring(x, { stiffness: 420, damping: 32, mass: 0.3 });
  const ringY = useSpring(y, { stiffness: 420, damping: 32, mass: 0.3 });

  React.useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(fine.matches && !reduced.matches);
    update();
    fine.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  React.useEffect(() => {
    if (!enabled) return;

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };
    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      setActive(Boolean(target?.closest?.(INTERACTIVE)));
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[1] size-[640px] rounded-full"
        style={{
          x: glowX,
          y: glowY,
          translateX: "-50%",
          translateY: "-50%",
          background: "radial-gradient(circle, var(--glow), transparent 62%)",
          opacity: visible ? 1 : 0,
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90] size-9 rounded-full border border-primary/50"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          scale: active ? 1.7 : 1,
          opacity: visible ? 1 : 0,
          backgroundColor: active ? "var(--glow)" : "rgba(0,0,0,0)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      />
    </>
  );
}
