import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  tone?: "sage" | "pink";
  children: ReactNode;
  className?: string;
}

// כרטיס ריק אחיד לכל האתר — אייקון בעיגול צבעוני (הישג/הזמנה לפעולה)
// במקום קופסת מקווקו שקטה מדי.
export default function EmptyState({
  icon: Icon,
  tone = "pink",
  children,
  className,
}: EmptyStateProps) {
  const toneClass =
    tone === "sage"
      ? "bg-skn-sage/10 text-skn-sage"
      : "bg-skn-pink/10 text-skn-pink-deep";

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl border border-dashed border-skn-sand bg-white p-8 text-center text-sm text-skn-ink/55 ${className ?? ""}`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full ${toneClass}`}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <p>{children}</p>
    </div>
  );
}
