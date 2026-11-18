import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Rich } from "@/components/rich";
import { cn, flipRtl } from "@/lib/utils";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
  back?: { href: string; label: string };
  /** Extra content under the heading (stats, actions). */
  children?: React.ReactNode;
  className?: string;
  /** Use for detail pages whose title is long. */
  compact?: boolean;
}

/** Heading block at the top of every content page. */
export function PageHero({ eyebrow, title, description, back, children, className, compact }: PageHeroProps) {
  return (
    <section className={cn("relative pb-10 pt-28 sm:pb-14 sm:pt-36", className)}>
      <div className="container-page">
        {back && (
          <Link
            href={back.href}
            className="group mb-8 inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <ArrowLeft className={cn("size-4 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5", flipRtl)} aria-hidden />
            {back.label}
          </Link>
        )}
        <Reveal className="max-w-4xl">
          <p className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            <span aria-hidden className="bg-brand h-px w-10" />
            {eyebrow}
          </p>
          <h1
            className={cn(
              "font-display font-medium tracking-tight text-balance rtl:leading-[1.35]",
              compact
                ? "text-3xl leading-[1.15] sm:text-4xl lg:text-5xl"
                : "text-4xl leading-[1.05] sm:text-6xl lg:text-7xl",
            )}
          >
            <Rich text={title} />
          </h1>
          {description && (
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg rtl:leading-loose">
              {description}
            </p>
          )}
        </Reveal>
        {children && <Reveal delay={0.1} className="mt-8">{children}</Reveal>}
      </div>
    </section>
  );
}

/** Small pill showing a number and a label, used in page heroes. */
export function StatPill({ value, label }: { value: string | number; label: string }) {
  return (
    <span className="glass inline-flex items-baseline gap-2 rounded-full px-4 py-2 text-sm">
      <span className="font-display text-lg font-medium tabular-nums">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}
