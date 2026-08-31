"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";

const LINKS = [
  { href: "/dashboard", label: "לוח בקרה" },
  { href: "/inventory", label: "ארון הטיפוח" },
  { href: "/schedule", label: "שגרה שבועית" },
  { href: "/reminders", label: "תזכורות תחזוקה" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-skn-sand bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/dashboard"
          className="font-display text-lg font-medium text-skn-pink-deep"
        >
          SkinSync
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-1.5 font-medium transition ${
                  active
                    ? "bg-skn-pink/10 text-skn-pink-deep"
                    : "text-skn-ink/65 hover:bg-skn-cream hover:text-skn-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 font-medium text-skn-ink/45 transition hover:bg-skn-pink/10 hover:text-skn-pink-deep"
            >
              התנתקות
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
