"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds a subtle 3D tilt that follows the pointer. */
  tilt?: boolean;
  /** Max tilt in degrees. */
  tiltAmount?: number;
}

/**
 * Glass card with a pointer-following spotlight (and optional 3D tilt).
 * Pointer position is written to CSS variables, so moving the mouse never re-renders React.
 */
export function SpotlightCard({
  className,
  children,
  tilt = false,
  tiltAmount = 6,
  ...props
}: SpotlightCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || event.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    if (tilt) {
      el.style.setProperty("--ry", `${((x / rect.width - 0.5) * tiltAmount).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${((0.5 - y / rect.height) * tiltAmount).toFixed(2)}deg`);
    }
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cn(
        "group/spot glass relative overflow-hidden rounded-3xl transition-[transform,translate,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:border-primary/30",
        className,
      )}
      style={
        tilt
          ? { transform: "perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))" }
          : undefined
      }
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background:
            "radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), var(--glow), transparent 65%)",
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
