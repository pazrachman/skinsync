import type { CSSProperties, ReactNode } from "react";
import BottleIllustration from "@/components/BottleIllustration";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

function delay(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms` };
}

// Shared frame for the login and signup screens. A form panel next to a
// warm brand panel — cream fading into peach and coral, the way morning
// light does. The gradient line is literal, not decorative: SkinSync's
// one job is tracking a routine that runs from morning to evening, so
// the signature is that same rhythm — and it's the one thing on the page
// that animates on its own terms, drawing itself in last.
export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-skn-cream px-4 py-10">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[1.75rem] border border-skn-sand bg-white shadow-[0_40px_90px_-50px_rgba(58,44,36,0.35)] lg:grid-cols-[1.05fr_1fr]">
        {/* Form panel */}
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12 sm:py-16">
          <div className="mx-auto w-full max-w-sm">
            <p
              className="skn-animate-fade-up font-mono text-[11px] uppercase tracking-[0.2em] text-skn-pink-deep"
              style={delay(0)}
            >
              {eyebrow}
            </p>
            <h1
              className="skn-animate-fade-up mt-3 font-display text-3xl font-medium text-skn-ink"
              style={delay(70)}
            >
              {title}
            </h1>
            <p
              className="skn-animate-fade-up mt-2 text-sm leading-relaxed text-skn-ink/60"
              style={delay(140)}
            >
              {subtitle}
            </p>

            <div className="skn-animate-fade-up mt-8" style={delay(210)}>
              {children}
            </div>

            <p
              className="skn-animate-fade-up mt-8 text-center text-sm text-skn-ink/60"
              style={delay(280)}
            >
              {footer}
            </p>
          </div>
        </div>

        {/* Brand panel — the "morning light" side, desktop only */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-skn-cream-deep via-[#f7e2cf] to-skn-pink/25 px-12 py-14 lg:flex">
          <div
            aria-hidden
            className="skn-animate-drift pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,rgba(239,154,92,0.35),transparent_60%),radial-gradient(120%_90%_at_0%_100%,rgba(232,99,122,0.28),transparent_55%)]"
          />

          <div className="relative">
            <p
              className="skn-animate-fade-up font-mono text-[11px] uppercase tracking-[0.25em] text-skn-ink/45"
              style={delay(120)}
            >
              אזור אישי · מאובטח
            </p>
            <p
              className="skn-animate-fade-up mt-6 font-display text-4xl text-skn-pink-deep"
              style={delay(190)}
            >
              SkinSync
            </p>
          </div>

          <div
            className="skn-animate-fade-up relative flex justify-center"
            style={delay(250)}
          >
            <BottleIllustration className="h-28 w-auto drop-shadow-[0_10px_20px_rgba(58,44,36,0.15)]" />
          </div>

          <div className="relative flex flex-col gap-10">
            <p
              className="skn-animate-fade-up max-w-[22ch] font-display text-2xl leading-snug text-skn-ink/85"
              style={delay(320)}
            >
              כל בקבוקון בזמן שלו — בוקר וערב.
            </p>

            <div className="flex items-center gap-3" dir="rtl">
              <span
                className="skn-animate-fade-up font-mono text-xs text-skn-ink/50"
                style={delay(560)}
              >
                בוקר
              </span>
              <span
                className="skn-animate-draw-line h-px flex-1 bg-gradient-to-l from-skn-peach to-skn-pink-deep"
                style={delay(600)}
              />
              <span
                className="skn-animate-fade-up font-mono text-xs text-skn-ink/50"
                style={delay(560)}
              >
                ערב
              </span>
            </div>

            <p
              className="skn-animate-fade-up font-mono text-[11px] tracking-wide text-skn-ink/35"
              style={delay(950)}
            >
              ארון הטיפוח · שגרה שבועית · תזכורות תחזוקה
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
