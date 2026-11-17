"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { deleteMessageAction, markMessageAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export interface MessageView {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  locale: string | null;
  isRead: boolean;
  createdAt: string;
}

export function MessagesList({ messages }: { messages: MessageView[] }) {
  const router = useRouter();
  const [openId, setOpenId] = React.useState<number | null>(null);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const run = (action: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (!result.ok) setError(result.error ?? "Something went wrong.");
      router.refresh();
    });

  const open = (m: MessageView) => {
    const next = openId === m.id ? null : m.id;
    setOpenId(next);
    if (next !== null && !m.isRead) run(() => markMessageAction(m.id, true));
  };

  if (messages.length === 0) {
    return (
      <p className="glass rounded-2xl p-6 text-sm text-muted-foreground">
        No messages yet. When visitors use the contact form on the website, their messages appear here.
      </p>
    );
  }

  const format = (iso: string) =>
    new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

  return (
    <div aria-busy={pending}>
      {error && (
        <p role="alert" className="mb-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <ul className="grid gap-2.5">
        {messages.map((m) => {
          const isOpen = openId === m.id;
          return (
            <li key={m.id} className={cn("glass overflow-hidden rounded-2xl", !m.isRead && "border-primary/40")}>
              <button
                type="button"
                onClick={() => open(m)}
                aria-expanded={isOpen}
                className="flex w-full items-start gap-3 p-4 text-start"
              >
                <span className={cn("mt-1 grid size-8 shrink-0 place-items-center rounded-full", m.isRead ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary")}>
                  {m.isRead ? <MailOpen className="size-4" aria-hidden /> : <Mail className="size-4" aria-hidden />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate", !m.isRead && "font-semibold")}>{m.subject}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {m.name} · {m.email}
                    {m.locale ? ` · ${m.locale === "ar" ? "Arabic site" : "English site"}` : ""}
                  </span>
                </span>
                <time className="shrink-0 text-xs text-muted-foreground">{format(m.createdAt)}</time>
              </button>
              {isOpen && (
                <div className="border-t border-border p-4 sm:px-6">
                  <p dir="auto" className="whitespace-pre-wrap text-[15px] leading-relaxed">
                    {m.message}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <a
                      href={`mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-sm font-medium text-background"
                    >
                      <Reply className="size-4" aria-hidden /> Reply by email
                    </a>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => markMessageAction(m.id, false))}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium"
                    >
                      <Mail className="size-4" aria-hidden /> Mark as unread
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        if (window.confirm("Delete this message permanently?")) {
                          setOpenId(null);
                          run(() => deleteMessageAction(m.id));
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-destructive hover:border-destructive/50"
                    >
                      <Trash2 className="size-4" aria-hidden /> Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
