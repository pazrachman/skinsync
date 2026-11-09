import type { CSSProperties, ReactNode } from "react";
import LoginVideo from "@/components/LoginVideo";

interface AuthShellProps {
  /** Optional status banners shown above the form. */
  notice?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}

function delay(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms` };
}

// Shared frame for login and signup: a narrow form column on the right
// (first in RTL) and the dropper video filling the rest, with no overlay.
// Below 820px the video becomes a clean top band and the column flows
// underneath. Styles live in the scoped `.skn-auth` block in globals.css.
export default function AuthShell({
  notice,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="skn-auth">
      <div className="skn-auth-form-side">
        <div className="skn-auth-form-inner">
          <div className="skn-animate-fade-up skn-auth-brand" style={delay(0)}>
            <h1 className="skn-auth-logo">SkinSync</h1>
            <p className="skn-auth-tagline" dir="ltr">
              it’s glow o’clock
            </p>
          </div>

          <div className="skn-auth-body">
            {notice && (
              <div className="skn-animate-fade-up" style={delay(70)}>
                {notice}
              </div>
            )}

            <div className="skn-animate-fade-up" style={delay(140)}>
              {children}
            </div>

            <p
              className="skn-animate-fade-up skn-auth-footer"
              style={delay(210)}
            >
              {footer}
            </p>
          </div>
        </div>
      </div>

      <div className="skn-auth-video-side">
        <LoginVideo />
      </div>
    </main>
  );
}
