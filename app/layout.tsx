import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/**
 * Self-hosted instead of next/font/google — this sandbox's network can't
 * reliably reach fonts.googleapis.com/fonts.gstatic.com from Turbopack's
 * own fetcher (confirmed via curl working fine while next dev/next build
 * both failed identically, in both dev and production compiles), so the
 * google loader made every route 500. These are the exact same files
 * Google Fonts serves for the same families/weights/latin subset — fetched
 * directly via curl (which the sandbox *can* reach reliably) — just
 * shipped in the repo instead of fetched at compile time. Variable names
 * are unchanged so nothing downstream (globals.css, every component
 * referencing --font-inter etc.) needed to change.
 */
const inter = localFont({
  variable: "--font-inter",
  src: "./fonts/inter-variable.woff2",
  weight: "400 700",
  display: "swap",
});

const interTight = localFont({
  variable: "--font-inter-tight",
  src: "./fonts/inter-tight-variable.woff2",
  weight: "500 700",
  display: "swap",
});

const jetbrainsMono = localFont({
  variable: "--font-jetbrains-mono",
  src: "./fonts/jetbrains-mono-variable.woff2",
  weight: "400 600",
  display: "swap",
});

// Landing page only (see components/landing) — the marketing page's mono
// spec (dm.to/ prefixes, platform badges) calls for IBM Plex Mono, distinct
// from the dashboard's JetBrains Mono.
const ibmPlexMono = localFont({
  variable: "--font-ibm-plex-mono",
  src: [
    { path: "./fonts/ibm-plex-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-500.woff2", weight: "500", style: "normal" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DM",
  description: "One page for everything you sell on Whop.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
