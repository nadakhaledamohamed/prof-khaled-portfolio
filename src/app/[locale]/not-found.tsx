import type { Metadata } from "next";
import { headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { Background } from "@/components/effects/background";
import { Button } from "@/components/ui/button";
import { getSiteContent } from "@/server/content";
import { defaultLocale, isLocale, localePath } from "@/i18n/config";
import { flipRtl } from "@/lib/utils";

export const metadata: Metadata = { title: "404", robots: { index: false } };

export default async function NotFound() {
  // not-found pages receive no params; the middleware passes the locale in a header.
  const requested = (await headers()).get("x-locale");
  const locale = isLocale(requested) ? requested : defaultLocale;
  const t = (await getSiteContent())[locale].notFound;

  return (
    <>
      <Background />
      <main className="relative z-10 grid min-h-[100svh] place-items-center px-6 text-center">
        <div>
          <p className="text-gradient font-display text-8xl font-medium sm:text-9xl">404</p>
          <h1 className="mt-4 font-display text-3xl font-medium sm:text-4xl">{t.title}</h1>
          <p className="mx-auto mt-3 max-w-sm text-muted-foreground">{t.text}</p>
          <Button asChild className="mt-8">
            <a href={localePath(locale)}>
              <ArrowLeft className={`group-hover/btn:-translate-x-0.5 ${flipRtl}`} /> {t.back}
            </a>
          </Button>
        </div>
      </main>
    </>
  );
}
