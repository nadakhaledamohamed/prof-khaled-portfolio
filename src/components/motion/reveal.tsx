"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { cn, easeOutExpo } from "@/lib/utils";

const viewport = { once: true, margin: "0px 0px -80px 0px" } as const;

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Distance travelled on the way in, in px. */
  y?: number;
  x?: number;
}

/** Fades and slides content in the first time it scrolls into view. */
export function Reveal({ children, className, delay = 0, y = 28, x = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={viewport}
      transition={{ duration: 0.9, delay, ease: easeOutExpo }}
    >
      {children}
    </motion.div>
  );
}

const containerVariants: Variants = {
  hidden: {},
  show: (stagger: number) => ({
    transition: { staggerChildren: stagger, delayChildren: 0.05 },
  }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeOutExpo },
  },
};

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  role?: "list";
}

/** Parent that reveals its <StaggerItem> children one after another. */
export function Stagger({ children, className, stagger = 0.08, role }: StaggerProps) {
  return (
    <motion.div
      role={role}
      className={className}
      variants={containerVariants}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  role?: "listitem";
}

export function StaggerItem({ children, className, role }: StaggerItemProps) {
  return (
    <motion.div role={role} className={cn(className)} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

interface WordsProps {
  text: string;
  className?: string;
  delay?: number;
}

/** Reveals a line of text word by word from behind a mask. */
export function Words({ text, className, delay = 0 }: WordsProps) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden
          className="inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1, delay: delay + i * 0.08, ease: easeOutExpo }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
