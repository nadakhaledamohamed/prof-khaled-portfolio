import * as React from "react";

interface RichProps {
  text: string;
  strongClassName?: string;
  emClassName?: string;
}

/**
 * Renders dictionary strings with lightweight markup:
 *   **bold**  → <strong>
 *   *accent*  → <em> (gradient accent in headings)
 */
export function Rich({
  text,
  strongClassName = "font-semibold text-foreground",
  emClassName = "text-gradient",
}: RichProps) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className={strongClassName}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
          return (
            <em key={i} className={emClassName}>
              {part.slice(1, -1)}
            </em>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}
