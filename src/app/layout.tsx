import type { Metadata } from "next";
import { Inter, Noto_Sans_Hebrew } from "next/font/google";
import "./globals.css";

// Type: SF Pro (system, not self-hosted) first, then Inter for Latin and
// Noto Sans Hebrew for Hebrew where SF isn't available. No serif, no mono.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansHebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew"],
  variable: "--font-noto-hebrew",
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
      className={`h-full antialiased ${inter.variable} ${notoSansHebrew.variable}`}
    >
      <body className="min-h-full flex flex-col bg-skn-cream font-sans text-skn-ink">
        {children}
      </body>
    </html>
  );
}
