import { Sparkle } from "lucide-react";
import type { Dictionary } from "@/content/types";

/** Infinite strip of affiliated institutions. Pauses on hover; the duplicate track is hidden from assistive tech. */
export function Marquee({ t }: { t: Dictionary["marquee"] }) {
  return (
    <section aria-label={t.label} className="relative z-10 border-y border-border py-6">
      <div className="group overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        {/* The track always scrolls the same way; forcing LTR keeps the loop seamless in Arabic too. */}
        <div dir="ltr" className="animate-marquee flex w-max group-hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
              {t.institutions.map((name) => (
                <li
                  key={name}
                  className="flex items-center whitespace-nowrap font-display text-xl text-muted-foreground sm:text-2xl"
                >
                  <span className="px-6 sm:px-8">{name}</span>
                  <Sparkle aria-hidden className="size-3.5 text-primary/60" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
