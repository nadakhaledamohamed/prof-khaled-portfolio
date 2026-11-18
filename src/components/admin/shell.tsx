"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ExternalLink,
  FileText,
  FolderOpen,
  Images,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Library,
  LogOut,
  Newspaper,
  PlaySquare,
  Presentation,
  ScrollText,
  Server,
  Type,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { monogram } from "@/data/site";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export function AdminShell({
  username,
  unread,
  children,
}: {
  username: string;
  unread: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const groups: { title: string; items: NavItem[] }[] = [
    {
      title: "Overview",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/messages", label: "Messages", icon: Inbox, badge: unread },
      ],
    },
    {
      title: "Content",
      items: [
        { href: "/admin/profile", label: "Profile & stats", icon: UserRound },
        { href: "/admin/cv", label: "Curriculum vitae", icon: ScrollText },
        { href: "/admin/books", label: "Books", icon: BookOpen },
        { href: "/admin/publications", label: "Research & studies", icon: FileText },
        { href: "/admin/articles", label: "Articles", icon: Newspaper },
        { href: "/admin/talks", label: "Courses & talks", icon: Presentation },
        { href: "/admin/videos", label: "Videos", icon: PlaySquare },
        { href: "/admin/systems", label: "System reviews", icon: Server },
        { href: "/admin/open-library", label: "Open repositories", icon: Library },
        { href: "/admin/gallery", label: "Gallery", icon: Images },
        { href: "/admin/collaborators", label: "Collaborators", icon: Users },
        { href: "/admin/content", label: "Site text (EN / AR)", icon: Type },
      ],
    },
    {
      title: "Settings",
      items: [
        { href: "/admin/media", label: "Media library", icon: FolderOpen },
        { href: "/admin/account", label: "Account", icon: KeyRound },
      ],
    },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  const allItems = groups.flatMap((g) => g.items);

  return (
    <div className="relative z-10 min-h-svh lg:grid lg:grid-cols-[17rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh flex-col border-e border-border bg-background/70 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3 px-6 pb-6 pt-7">
          <span className="bg-brand grid size-10 place-items-center rounded-xl font-display font-semibold text-white dark:text-[#070a12]">
            {monogram}
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Portfolio admin</p>
            <p className="text-xs text-muted-foreground">Signed in as {username}</p>
          </div>
        </div>

        <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3">
          {groups.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="mb-1.5 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {group.title}
              </p>
              <ul className="grid gap-0.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-foreground/[0.07] text-foreground dark:bg-white/10"
                          : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" aria-hidden />
                      <span className="flex-1">{item.label}</span>
                      {item.badge ? (
                        <span className="bg-brand rounded-full px-2 py-0.5 text-[11px] font-semibold text-white dark:text-[#070a12]">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="grid gap-2 border-t border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <ThemeToggle labels={{ toDark: "Switch to dark mode", toLight: "Switch to light mode" }} />
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
          <div className="flex gap-2 text-xs">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              View EN <ExternalLink className="size-3" aria-hidden />
            </a>
            <a
              href="/ar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              View AR <ExternalLink className="size-3" aria-hidden />
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="bg-brand grid size-9 place-items-center rounded-xl font-display text-sm font-semibold text-white dark:text-[#070a12]">
              {monogram}
            </span>
            <p className="text-sm font-semibold">Admin</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle labels={{ toDark: "Switch to dark mode", toLight: "Switch to light mode" }} />
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Sign out"
                className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
        <nav aria-label="Admin" className="-mb-px flex gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none]">
          {allItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
                isActive(item.href)
                  ? "bg-foreground text-background"
                  : "border border-border text-muted-foreground",
              )}
            >
              <item.icon className="size-3.5" aria-hidden />
              {item.label}
              {item.badge ? <span className="font-semibold">({item.badge})</span> : null}
            </Link>
          ))}
        </nav>
      </div>

      <main className="min-w-0 px-4 pb-32 pt-6 sm:px-8 lg:px-12 lg:pt-10">{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
