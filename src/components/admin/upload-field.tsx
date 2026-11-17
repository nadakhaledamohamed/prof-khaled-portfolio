"use client";

import * as React from "react";
import Image from "next/image";
import { CircleAlert, ExternalLink, FileText, LoaderCircle, Upload, X } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { registerMediaAction } from "@/app/admin/actions";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface UploadFieldProps {
  id: string;
  value: string | null;
  onChange: (value: string | null) => void;
  accept: "image" | "pdf" | "any";
  /** Allows clearing the value (optional files). */
  clearable?: boolean;
  placeholder?: string;
}

const ACCEPT_ATTR = {
  image: "image/jpeg,image/png,image/webp,image/gif,image/avif",
  pdf: "application/pdf",
  any: "image/jpeg,image/png,image/webp,image/gif,image/avif,application/pdf",
};

/** A link field with an upload button: upload a file, or paste a /path or URL. */
export function UploadField({ id, value, onChange, accept, clearable, placeholder }: UploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    // Friendly checks first; the server enforces the same rules on the upload token.
    const isPdf = file.type === "application/pdf";
    const isImage = /^image\/(jpeg|png|webp|gif|avif)$/.test(file.type);
    if (accept === "image" && !isImage) return setError("Please choose a JPG, PNG, WebP, GIF or AVIF image.");
    if (accept === "pdf" && !isPdf) return setError("Please choose a PDF file.");
    if (accept === "any" && !isPdf && !isImage) return setError("Use an image (JPG, PNG, WebP, GIF, AVIF) or a PDF.");
    const max = isPdf ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > max) return setError(`File is too large (max ${isPdf ? 25 : 10} MB).`);

    setError(null);
    setUploading(true);
    try {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "") || "file";
      const blob = await upload(`media/${safeName}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        clientPayload: accept,
        multipart: file.size > 5 * 1024 * 1024,
      });
      await registerMediaAction({
        url: blob.url,
        pathname: blob.pathname,
        name: file.name,
        type: file.type,
        size: file.size,
      });
      onChange(blob.url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(/signed in/i.test(message) ? "Your session expired. Please sign in again." : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const isImage = value && /\.(jpe?g|png|webp|gif|avif)$/i.test(value);
  const isPdf = value && /\.pdf$/i.test(value);

  return (
    <div>
      <div className="flex items-start gap-3">
        {accept !== "pdf" && (
          <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted">
            {isImage ? (
              <Image src={value} alt="" fill sizes="64px" unoptimized className="object-cover" />
            ) : isPdf ? (
              <FileText className="size-5 text-muted-foreground" aria-hidden />
            ) : (
              <Upload className="size-5 text-muted-foreground/60" aria-hidden />
            )}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex gap-2">
            <Input
              id={id}
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value || (clearable ? null : ""))}
              placeholder={placeholder ?? "Upload a file or paste a link"}
              dir="ltr"
              className="h-10 min-w-0 flex-1 text-sm"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-2xl border border-border px-3 text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-60"
            >
              {uploading ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
              <span className="hidden sm:inline">{uploading ? "Uploading…" : "Upload"}</span>
            </button>
            {clearable && value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                aria-label="Remove file"
                className="grid size-10 shrink-0 place-items-center rounded-2xl border border-border text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
            <span>
              {accept === "image" ? "JPG, PNG, WebP, GIF or AVIF · up to 10 MB" : accept === "pdf" ? "PDF · up to 25 MB" : "Image (10 MB) or PDF (25 MB)"}
            </span>
            {value && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Open <ExternalLink className="size-3" aria-hidden />
              </a>
            )}
          </div>
          {error && (
            <p role="alert" className={cn("mt-1.5 flex items-center gap-1.5 text-xs text-destructive")}>
              <CircleAlert className="size-3.5" aria-hidden /> {error}
            </p>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR[accept]}
        onChange={onFile}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />
    </div>
  );
}
