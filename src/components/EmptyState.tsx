import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// מצב ריק: הזמנה לפעולה, לא מצב רוח.
export default function EmptyState({
  icon: Icon,
  children,
  className,
}: {
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`skn-card skn-empty ${className ?? ""}`}>
      <span className="skn-empty-icon">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <p>{children}</p>
    </div>
  );
}
