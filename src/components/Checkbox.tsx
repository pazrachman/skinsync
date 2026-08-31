"use client";

import { Check } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

const TONE_CLASSES: Record<"pink" | "lilac" | "neutral", string> = {
  pink: "peer-checked:border-skn-pink-deep peer-checked:bg-skn-pink-deep peer-focus-visible:ring-skn-pink/30",
  lilac: "peer-checked:border-skn-lilac peer-checked:bg-skn-lilac peer-focus-visible:ring-skn-lilac/30",
  neutral: "peer-checked:border-skn-ink/50 peer-checked:bg-skn-ink/50 peer-focus-visible:ring-skn-ink/20",
};

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  tone?: "pink" | "lilac" | "neutral";
  labelClassName?: string;
}

// כפתור סימון מותאם למותג — אותה אינטראקציה (סימון = ריטואל שהושלם) חוזרת
// בכל מקום שבו יש checkbox באתר: שגרת היום, שגרה שבועית, רכיבים פעילים.
export default function Checkbox({
  label,
  tone = "pink",
  className,
  labelClassName,
  ...props
}: CheckboxProps) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-2 ${className ?? ""}`}
    >
      <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none"
          {...props}
        />
        <span
          className={`pointer-events-none h-4 w-4 rounded border border-skn-sand bg-white transition-colors duration-150 peer-focus-visible:ring-2 ${TONE_CLASSES[tone]}`}
        />
        <Check
          strokeWidth={3}
          className="pointer-events-none absolute h-3 w-3 scale-0 text-white opacity-0 transition-all duration-150 peer-checked:scale-100 peer-checked:opacity-100"
        />
      </span>
      {label !== undefined && (
        <span className={labelClassName}>{label}</span>
      )}
    </label>
  );
}
