import * as React from "react";
import { Reveal } from "@/components/motion/reveal";
import { Rich } from "@/components/rich";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id: string;
  children: React.ReactNode;
}

export function Section({ id, className, children, ...props }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("relative scroll-mt-24 py-20 sm:py-28 lg:py-32", className)}
      {...props}
    >
      <div className="container-page">{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  id: string;
  index: string;
  eyebrow: string;
  /** Wrap a phrase in *asterisks* for the gradient accent. */
  title: string;
  description?: string;
  align?: "start" | "center";
  className?: string;
}

export function SectionHeading({
  id,
  index,
  eyebrow,
  title,
  description,
  align = "start",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "mb-12 max-w-3xl sm:mb-16",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p
        className={cn(
          "mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground",
          align === "center" && "justify-center",
        )}
      >
        <span className="text-primary">{index}</span>
        <span aria-hidden className="h-px w-8 bg-border" />
        {eyebrow}
      </p>
      <h2
        id={`${id}-title`}
        className="font-display text-[2rem] font-medium leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-[3.5rem] rtl:leading-[1.3]"
      >
        <Rich text={title} />
      </h2>
      {description && (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
          {description}
        </p>
      )}
    </Reveal>
  );
}
