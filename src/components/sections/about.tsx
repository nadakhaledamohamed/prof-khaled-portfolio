import { Quote } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Rich } from "@/components/rich";
import type { Dictionary } from "@/content/types";

export function About({ t }: { t: Dictionary["about"] }) {
  return (
    <Section id="about">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            id="about"
            index="01"
            eyebrow={t.eyebrow}
            title={t.title}
            className="mb-10 sm:mb-10"
          />
          <Parallax offset={24}>
            <Reveal delay={0.1}>
              <figure className="neu relative rounded-3xl p-7 sm:p-8">
                <Quote aria-hidden className="mb-4 size-7 text-primary rtl:-scale-x-100" />
                <blockquote className="font-display text-2xl italic leading-snug text-balance sm:text-[1.75rem] rtl:leading-relaxed">
                  {t.question}
                </blockquote>
                <figcaption className="mt-5 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  {t.questionCaption}
                </figcaption>
              </figure>
            </Reveal>
          </Parallax>
        </div>

        <div>
          <div className="space-y-6 text-base leading-[1.8] text-muted-foreground text-pretty sm:text-lg rtl:leading-[2]">
            {t.paragraphs.map((paragraph, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p>
                  <Rich text={paragraph} />
                </p>
              </Reveal>
            ))}
          </div>

          <Stagger role="list" className="mt-12 grid grid-cols-2 gap-3 sm:gap-4">
            {t.facts.map((fact) => (
              <StaggerItem
                key={fact.label}
                role="listitem"
                className="glass rounded-2xl p-5 transition-[translate,border-color] duration-500 hover:-translate-y-1 hover:border-primary/30"
              >
                <p className="font-display text-xl font-medium leading-tight sm:text-2xl rtl:leading-snug">
                  {fact.value}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">{fact.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </Section>
  );
}
