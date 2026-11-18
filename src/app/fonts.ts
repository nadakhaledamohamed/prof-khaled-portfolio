import { Fraunces, Geist_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";

/*
 * Latin faces from Google Fonts; Arabic faces self-hosted from the files that came with the
 * previous site (Amiri for headings, IBM Plex Sans Arabic for text). The Arabic files only
 * contain Arabic glyphs, so browsers download them only when Arabic text is on screen.
 */
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
});

export const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const plexArabic = localFont({
  variable: "--font-plex-ar",
  display: "swap",
  preload: false,
  src: [
    { path: "../fonts/ibm-plex-sans-arabic-arabic-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ibm-plex-sans-arabic-arabic-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/ibm-plex-sans-arabic-arabic-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/ibm-plex-sans-arabic-arabic-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

export const amiri = localFont({
  variable: "--font-amiri",
  display: "swap",
  preload: false,
  src: [
    { path: "../fonts/amiri-arabic-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/amiri-arabic-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

export const fontVariables = [inter, fraunces, geistMono, plexArabic, amiri].map((f) => f.variable).join(" ");
