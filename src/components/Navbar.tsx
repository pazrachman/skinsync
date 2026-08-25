import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

const LINKS = [
  { href: "/dashboard", label: "לוח בקרה" },
  { href: "/inventory", label: "ארון הטיפוח" },
  { href: "/schedule", label: "שגרה שבועית" },
  { href: "/reminders", label: "תזכורות תחזוקה" },
];

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/dashboard" className="text-lg font-bold text-rose-600">
          SkinSync
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
            >
              התנתקות
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
