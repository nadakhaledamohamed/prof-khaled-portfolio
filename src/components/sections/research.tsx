import {
  FlaskConical,
  Globe,
  Handshake,
  Library,
  Search,
  Tags,
  type LucideIcon,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { Dictionary } from "@/content/types";
import type { FocusArea } from "@/types";

const icons: Record<FocusArea["icon"], LucideIcon> = {
  search: Search,
  library: Library,
  globe: Globe,
  tags: Tags,
  handshake: Handshake,
  flask: FlaskConical,
};

export function Research({ t }: { t: Dictionary["research"] }) {
  return (
    <Section id="research">
      <SectionHeading
        id="research"
        index="04"
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />

      <Stagger role="list" className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {t.areas.map((area, i) => {
          const Icon = icons[area.icon];
          return (
            <StaggerItem key={area.title} role="listitem">
              <SpotlightCard tilt className="h-full p-6 sm:p-8">
                <div className="flex items-start justify-between">
                  <div className="neu grid size-13 place-items-center rounded-2xl text-primary transition-transform duration-500 group-hover/spot:-rotate-6 group-hover/spot:scale-110">
                    <Icon className="size-6" aria-hidden />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-7 font-display text-2xl font-medium">{area.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground rtl:leading-loose">
                  {area.description}
                </p>
                <span
                  aria-hidden
                  className="bg-brand mt-7 block h-px w-10 transition-[width] duration-700 ease-out group-hover/spot:w-full"
                />
              </SpotlightCard>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
