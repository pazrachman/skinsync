import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkinSync — מנהל שגרת הטיפוח החכם שלך",
  description:
    "ניהול חכם של ארון הטיפוח, מעקב תפוגה, שגרה שבועית ותזכורות תחזוקה.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}
