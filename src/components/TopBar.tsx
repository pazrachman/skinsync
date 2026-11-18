"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";

const LINKS = [
  { href: "/dashboard", label: "היום" },
  { href: "/inventory", label: "הארון" },
  { href: "/schedule", label: "שגרה שבועית" },
  { href: "/reminders", label: "תזכורות" },
];

export default function TopBar({
  displayName,
  email,
}: {
  displayName: string | null;
  email: string | null;
}) {
  const pathname = usePathname();
  const initial = (displayName || email || "?").trim().charAt(0).toUpperCase();

  return (
    <header className="skn-topbar">
      <div className="skn-topbar-inner">
        <Link href="/dashboard" className="skn-logo">
          SkinSync
        </Link>

        <nav className="skn-nav" aria-label="ניווט ראשי">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className="skn-nav-link"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <AccountMenu initial={initial} displayName={displayName} email={email} />
      </div>
    </header>
  );
}

function AccountMenu({
  initial,
  displayName,
  email,
}: {
  initial: string;
  displayName: string | null;
  email: string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="skn-account" ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        className="skn-avatar"
        aria-label="החשבון שלי"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {initial}
      </button>
      {open && (
        <div className="skn-menu" role="menu">
          <div className="skn-menu-who">
            {displayName && <p className="font-semibold">{displayName}</p>}
            {email && (
              <p className="truncate text-sm text-skn-muted" dir="ltr" style={{ textAlign: "right" }}>
                {email}
              </p>
            )}
          </div>
          <form action={signOut}>
            <button type="submit" role="menuitem" className="skn-menu-item">
              התנתקות
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
