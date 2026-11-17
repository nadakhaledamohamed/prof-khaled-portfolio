import { Award as AwardIcon, Medal } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { Dictionary } from "@/content/types";

export function Awards({ t }: { t: Dictionary["awards"] }) {
  const featured = t.items.find((a) => a.featured);
  const others = t.items.filter((a) => !a.featured);

  return (
    <Section id="awards">
      <SectionHeading id="awards" index="07" eyebrow={t.eyebrow} title={t.title} />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
        {featured && (
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-3xl bg-foreground p-8 text-background sm:p-10">
              <Parallax offset={40} className="pointer-events-none absolute -end-10 -top-10">
                <AwardIcon aria-hidden strokeWidth={0.6} className="size-64 opacity-[0.09]" />
              </Parallax>
              <div
                aria-hidden
                className="bg-brand absolute -bottom-24 -start-16 size-64 rounded-full opacity-40 blur-3xl"
              />
              <div className="relative flex h-full flex-col">
                <span className="mb-10 inline-flex w-fit items-center gap-2 rounded-full border border-background/20 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em]">
                  <Medal className="size-3.5" aria-hidden />
                  {featured.year}
                </span>
                <h3 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-balance sm:text-5xl rtl:leading-[1.3]">
                  {featured.title}
                </h3>
                <p className="mt-3 font-display text-xl italic opacity-80">{featured.issuer}</p>
                <p className="mt-auto max-w-md pt-10 text-[15px] leading-relaxed opacity-75">
                  {featured.description}
                </p>
              </div>
            </div>
          </Reveal>
        )}

        <Stagger role="list" className="grid gap-4">
          {others.map((award) => (
            <StaggerItem key={award.title} role="listitem">
              <SpotlightCard className="p-6 sm:p-7">
                <div className="flex gap-5">
                  <div className="neu grid size-12 shrink-0 place-items-center rounded-2xl text-accent transition-transform duration-500 group-hover/spot:rotate-12">
                    <AwardIcon className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="text-base font-semibold leading-snug sm:text-lg">
                        {award.title}
                      </h3>
                      {award.year && (
                        <span className="font-mono text-xs text-muted-foreground">{award.year}</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-primary">{award.issuer}</p>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                      {award.description}
                    </p>
                  </div>
                </div>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
