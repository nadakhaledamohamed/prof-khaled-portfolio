import * as React from "react";
import Image from "next/image";
import { isUpload } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * Renders the plain-text format used by articles, the CV and research abstracts:
 *   "## " / "### " headings, "- " or "• " bullets (indented lines continue the bullet),
 *   "1. " numbered items, lines ending with ":" as small headings,
 *   [[img:/path]] figures, and bare URLs as links. Everything else is a paragraph.
 * Text is never treated as HTML.
 */
interface BodyTextProps {
  text: string;
  lang?: "ar" | "en";
  className?: string;
  figureLabel?: string;
}

type Block =
  | { kind: "h2" | "h3" | "label" | "p"; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "figure"; src: string };

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let para: string[] = [];
  let list: { kind: "ul" | "ol"; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) blocks.push({ kind: "p", text: para.join("\n") });
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      flushPara();
      flushList();
      continue;
    }
    const figure = trimmed.match(/^\[\[img:([^\]]+)\]\]$/);
    if (figure) {
      flushPara();
      flushList();
      blocks.push({ kind: "figure", src: figure[1] });
      continue;
    }
    const heading = trimmed.match(/^(#{2,4})\s+(.*)$/);
    if (heading) {
      flushPara();
      flushList();
      blocks.push({ kind: heading[1].length === 2 ? "h2" : "h3", text: heading[2] });
      continue;
    }
    const bullet = trimmed.match(/^[-•*]\s+(.*)$/);
    const numbered = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      flushPara();
      const kind = bullet ? "ul" : "ol";
      if (!list || list.kind !== kind) {
        flushList();
        list = { kind, items: [] };
      }
      list.items.push((bullet ?? numbered)![1]);
      continue;
    }
    // Indented line right after a bullet continues that bullet.
    if (list && /^\s+/.test(raw)) {
      list.items[list.items.length - 1] += `\n${trimmed}`;
      continue;
    }
    flushList();
    if (trimmed.endsWith(":") && trimmed.length < 80 && !para.length) {
      blocks.push({ kind: "label", text: trimmed.slice(0, -1) });
      continue;
    }
    para.push(trimmed);
  }
  flushPara();
  flushList();
  return blocks;
}

const URL_RE = /(https?:\/\/[^\s)]+)/g;

function Inline({ text }: { text: string }) {
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((part, i) => {
        if (/^https?:\/\//.test(part)) {
          let label = part;
          try {
            const u = new URL(part);
            label = u.hostname.replace(/^www\./, "") + (u.pathname.length > 1 ? "/…" : "");
          } catch {
            /* keep raw */
          }
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="break-all text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
            >
              {label}
            </a>
          );
        }
        return (
          <React.Fragment key={i}>
            {part.split("\n").map((line, j, all) => (
              <React.Fragment key={j}>
                {line}
                {j < all.length - 1 && <br />}
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      })}
    </>
  );
}

export function BodyText({ text, lang, className, figureLabel = "Figure" }: BodyTextProps) {
  const blocks = parse(text);
  let figureNo = 0;

  return (
    <div
      lang={lang}
      dir={lang === "ar" ? "rtl" : lang === "en" ? "ltr" : undefined}
      className={cn("body-text text-[17px] leading-[1.85] text-foreground/85", lang === "ar" && "leading-[2.1]", className)}
    >
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "h2":
            return (
              <h2 key={i} className="mb-4 mt-12 font-display text-2xl font-medium text-foreground first:mt-0 sm:text-3xl">
                <Inline text={block.text} />
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mb-3 mt-8 text-lg font-semibold text-foreground">
                <Inline text={block.text} />
              </h3>
            );
          case "label":
            return (
              <p key={i} className="mb-3 mt-8 font-mono text-xs uppercase tracking-[0.2em] text-primary first:mt-0">
                {block.text}
              </p>
            );
          case "ul":
          case "ol": {
            const List = block.kind;
            return (
              <List
                key={i}
                className={cn(
                  "my-5 grid gap-3 ps-6",
                  block.kind === "ul" ? "list-none" : "list-decimal marker:font-semibold marker:text-primary",
                )}
              >
                {block.items.map((item, j) => (
                  <li key={j} className={cn("relative", block.kind === "ul" && "before:absolute before:-start-5 before:top-[0.75em] before:size-1.5 before:rounded-full before:bg-primary/70")}>
                    <Inline text={item} />
                  </li>
                ))}
              </List>
            );
          }
          case "figure": {
            figureNo += 1;
            return (
              <figure key={i} className="my-8">
                <div className="overflow-hidden rounded-2xl border border-border bg-white p-3">
                  <Image
                    src={block.src}
                    alt={`${figureLabel} ${figureNo}`}
                    width={1200}
                    height={800}
                    sizes="(min-width: 768px) 720px, 100vw"
                    unoptimized={isUpload(block.src)}
                    className="mx-auto h-auto max-h-[70vh] w-auto"
                  />
                </div>
                <figcaption className="mt-2 text-center text-xs text-muted-foreground">
                  {figureLabel} {figureNo}
                </figcaption>
              </figure>
            );
          }
          default:
            return (
              <p key={i} className="my-5 text-pretty">
                <Inline text={block.text} />
              </p>
            );
        }
      })}
    </div>
  );
}
