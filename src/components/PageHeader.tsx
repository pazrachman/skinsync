import type { ReactNode } from "react";

export default function PageHeader({
  eyebrow,
  title,
  actions,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="skn-page-header">
      <div>
        {eyebrow && <p className="skn-eyebrow">{eyebrow}</p>}
        <h1 className="skn-title">{title}</h1>
        {children}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
