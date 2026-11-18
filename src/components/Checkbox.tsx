"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  /** ritual: round 24px (routine) · dot: round 18px tinted by slot (week) · box: form field */
  variant?: "ritual" | "dot" | "box";
  slot?: "morning" | "evening";
  labelClassName?: string;
}

// סימון = ריטואל שהושלם: העיגול מתמלא בצבע הסרום, ה-V נמשך והשם נמחק
// בקו — הכל ב-CSS (ראו .skn-check ב-globals.css). ביטול סימון מיידי.
export default function Checkbox({
  label,
  variant = "ritual",
  slot,
  className,
  labelClassName,
  ...props
}: CheckboxProps) {
  return (
    <label className={`skn-check ${className ?? ""}`} data-variant={variant} data-slot={slot}>
      <input type="checkbox" className="skn-check-input" {...props} />
      <span className="skn-check-box" aria-hidden>
        <svg viewBox="0 0 24 24">
          <path d="M7.2 12.4 10.4 15.6 16.8 9" />
        </svg>
      </span>
      {label !== undefined && (
        <span className={`skn-check-text ${labelClassName ?? ""}`}>
          <span>{label}</span>
        </span>
      )}
    </label>
  );
}
