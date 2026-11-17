import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Images, Inbox, Quote, Type, Users } from "lucide-react";
import { DbError } from "@/components/admin/db-error";
import { PageHeader } from "@/components/admin/shell";
import { readSiteContent } from "@/server/content";
import { countUnreadMessages, listMessages } from "@/server/messages";

export const metadata: Metadata = { title: "Dashboard" };

function formatDate(date: Date | null) {
  if (!date) return "Not yet edited";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function DashboardPage() {
  let loaded;
  try {
    const [content, messages, unread] = await Promise.all([
      readSiteContent(),
      listMessages(),
      countUnreadMessages(),
    ]);
    loaded = { ...content, messages, unread };
  } catch (error) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <DbError error={error} />
      </>
    );
  }

  const { content, updatedAt, updatedBy, messages, unread } = loaded;
  const { data } = content;
  const citations = data.metrics.find((m) => m.id === "citations")?.value ?? 0;

  const cards = [
    { href: "/admin/books", label: "Books", value: data.books.length, icon: BookOpen },
    { href: "/admin/publications", label: "Publications", value: data.publications.length, icon: FileText },
    { href: "/admin/gallery", label: "Gallery items", value: data.gallery.length, icon: Images },
    { href: "/admin/collaborators", label: "Collaborators", value: data.collaborators.length, icon: Users },
    { href: "/admin/profile", label: "Citations shown", value: citations, icon: Quote },
    { href: "/admin/messages", label: "Unread messages", value: unread, icon: Inbox },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={
          <>
            Last saved: <span className="font-medium text-foreground">{formatDate(updatedAt)}</span>
            {updatedBy && updatedBy !== "seed" ? ` by ${updatedBy}` : ""}. Changes go live as soon as you save.
          </>
        }
      />

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.label}>
            <Link
              href={card.href}
              className="glass group flex h-full flex-col gap-4 rounded-2xl p-5 transition-[translate,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/40"
            >
              <span className="neu grid size-10 place-items-center rounded-xl text-primary">
                <card.icon className="size-4.5" aria-hidden />
              </span>
              <span>
                <span className="block font-display text-3xl font-medium tabular-nums">{card.value}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{card.label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="glass rounded-3xl p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Latest messages</h2>
            <Link href="/admin/messages" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              Open inbox <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No messages yet. Messages sent through the website&apos;s contact form appear here.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {messages.slice(0, 5).map((m) => (
                <li key={m.Id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {!m.IsRead && <span className="me-2 inline-block size-2 rounded-full bg-primary align-middle" />}
                      {m.Subject}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.Name} · {m.Email}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">{formatDate(m.CreatedAt)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="glass rounded-3xl p-5 sm:p-6">
          <h2 className="mb-4 font-semibold">Quick links</h2>
          <ul className="grid gap-2 text-sm">
            {[
              { href: "/admin/content/hero", label: "Edit the hero introduction", icon: Type },
              { href: "/admin/content/about", label: "Edit the About section", icon: Type },
              { href: "/admin/content/journey", label: "Edit experience & education", icon: Type },
              { href: "/admin/content/awards", label: "Edit awards", icon: Type },
              { href: "/admin/content/network", label: "Add testimonials", icon: Type },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <link.icon className="size-4 text-muted-foreground" aria-hidden />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
