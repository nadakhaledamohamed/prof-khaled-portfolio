import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Portfolio admin" },
  robots: { index: false, follow: false },
};

/** Separate root layout: the admin is English-only and never shows the public site's chrome. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={fontVariables}>
      <body className="min-h-svh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
