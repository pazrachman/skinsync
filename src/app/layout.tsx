import type { Metadata } from "next";
import { Assistant, Frank_Ruhl_Libre, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Type system for SkinSync: a Hebrew-native serif for display moments
// (Frank Ruhl Libre), a warm humanist sans for interface text (Assistant),
// and a monospace face for label-style micro-copy — dates, ref codes —
// the way a product's own packaging prints them (IBM Plex Mono).
const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-assistant",
  display: "swap",
});

const frankRuhlLibre = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-frank-ruhl",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkinSync — מנהל שגרת הטיפוח החכם שלך",
  description:
    "ניהול חכם של ארון הטיפוח, מעקב תפוגה, שגרה שבועית ותזכורות תחזוקה.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`h-full antialiased ${assistant.variable} ${frankRuhlLibre.variable} ${plexMono.variable}`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}
