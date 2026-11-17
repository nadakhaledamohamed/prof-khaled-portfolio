import * as React from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-2xl border border-border bg-background/60 px-4 text-[15px] text-foreground placeholder:text-muted-foreground/70 transition-[border-color,box-shadow,background-color] duration-300 hover:border-foreground/25 focus:border-primary focus:bg-background focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_16%,transparent)] focus:outline-none aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--destructive)_16%,transparent)]";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(control, "h-12", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(control, "min-h-36 resize-y py-3 leading-relaxed", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-2 block text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}
