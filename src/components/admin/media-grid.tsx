"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Copy, ExternalLink, FileText, Trash2 } from "lucide-react";
import { deleteMediaAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import { UploadField } from "./upload-field";

export interface MediaView {
  id: number;
  url: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  inUse: boolean;
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaGrid({ items }: { items: MediaView[] }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [copied, setCopied] = React.useState<number | null>(null);
  const [uploaded, setUploaded] = React.useState<string | null>(null);

  const copy = async (item: MediaView) => {
    await navigator.clipboard.writeText(item.url).catch(() => undefined);
    setCopied(item.id);
    window.setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="grid gap-6">
      <section className="glass rounded-3xl p-5 sm:p-6">
        <h2 className="font-semibold">Upload a file</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Files uploaded from the editors appear here automatically. You can also upload here and paste the link anywhere.
        </p>
        <UploadField
          id="library-upload"
          value={uploaded}
          onChange={(url) => {
            setUploaded(url);
            router.refresh();
          }}
          accept="any"
          clearable
        />
      </section>

      {items.length === 0 ? (
        <p className="glass rounded-2xl p-6 text-sm text-muted-foreground">No uploaded files yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" aria-busy={pending}>
          {items.map((item) => {
            const isImage = item.type.startsWith("image/");
            return (
              <li key={item.id} className="glass flex flex-col overflow-hidden rounded-2xl">
                <div className="relative grid aspect-[4/3] place-items-center bg-muted">
                  {isImage ? (
                    <Image src={item.url} alt="" fill sizes="220px" unoptimized className="object-cover" />
                  ) : (
                    <FileText className="size-8 text-muted-foreground" aria-hidden />
                  )}
                  <span
                    className={cn(
                      "absolute start-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      item.inUse ? "bg-primary text-primary-foreground" : "bg-black/60 text-white",
                    )}
                  >
                    {item.inUse ? "In use" : "Not used"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <p className="truncate text-sm font-medium" title={item.name}>{item.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(item.size)}</p>
                  <div className="mt-auto flex gap-1">
                    <button type="button" onClick={() => copy(item)} aria-label="Copy link" title="Copy link" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground">
                      {copied === item.id ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
                    </button>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label="Open" title="Open" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground">
                      <ExternalLink className="size-4" />
                    </a>
                    <button
                      type="button"
                      disabled={item.inUse || pending}
                      title={item.inUse ? "Remove it from the site first" : "Delete file"}
                      aria-label="Delete file"
                      onClick={() => {
                        if (!window.confirm(`Delete "${item.name}" permanently?`)) return;
                        startTransition(async () => {
                          await deleteMediaAction(item.id);
                          router.refresh();
                        });
                      }}
                      className="ms-auto grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-30"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
