import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Inter, Noto_Kufi_Arabic } from "next/font/google";
import { Providers } from "@/components/providers";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-ar",
  display: "swap",
  preload: false,
});
const kufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-kufi",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Portfolio admin" },
  robots: { index: false, follow: false },
};

/** Separate root layout: the admin is English-only and never shows the public site's chrome. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${inter.variable} ${plexArabic.variable} ${kufiArabic.variable}`}
    >
      <body className="min-h-svh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
