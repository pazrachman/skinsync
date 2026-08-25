import type { ReactNode } from "react";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

// Shared frame for the login and signup screens. Split into a form panel
// (the actual task) and a brand panel styled like a product label affixed
// to a dark glass bottle — the way skincare actives ship protected from
// light. The gradient line is literal: SkinSync's one job is tracking a
// routine that runs from morning to evening, so the signature is that
// same rhythm, not a decorative flourish.
export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-skn-paper px-4 py-10">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[1.75rem] border border-skn-mist bg-white shadow-[0_40px_90px_-45px_rgba(32,27,22,0.45)] lg:grid-cols-[1.05fr_1fr]">
        {/* Form panel */}
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12 sm:py-16">
          <div className="mx-auto w-full max-w-sm">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-skn-amber">
              {eyebrow}
            </p>
            <h1 className="mt-3 font-display text-3xl font-medium text-skn-ink">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-skn-ink/60">
              {subtitle}
            </p>

            <div className="mt-8">{children}</div>

            <p className="mt-8 text-center text-sm text-skn-ink/60">
              {footer}
            </p>
          </div>
        </div>

        {/* Brand panel — the "label" side, desktop only */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-skn-ink px-12 py-14 lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,rgba(208,149,74,0.35),transparent_60%),radial-gradient(120%_90%_at_0%_100%,rgba(92,34,51,0.6),transparent_55%)]"
          />

          <div className="relative">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-skn-paper/50">
              אזור אישי · מאובטח
            </p>
            <p className="mt-6 font-display text-4xl text-skn-paper">
              SkinSync
            </p>
          </div>

          <div className="relative flex flex-col gap-10">
            <p className="max-w-[22ch] font-display text-2xl leading-snug text-skn-paper/90">
              כל בקבוקון בזמן שלו — בוקר וערב.
            </p>

            <div className="flex items-center gap-3" dir="rtl">
              <span className="font-mono text-xs text-skn-paper/60">
                בוקר
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-skn-amber-light to-skn-wine" />
              <span className="font-mono text-xs text-skn-paper/60">
                ערב
              </span>
            </div>

            <p className="font-mono text-[11px] tracking-wide text-skn-paper/40">
              ארון הטיפוח · שגרה שבועית · תזכורות תחזוקה
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
