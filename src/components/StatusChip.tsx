import type { ReactNode } from "react";
import type { ReminderStatus } from "@/lib/expiry";
import type { ExpiryStatus } from "@/lib/types";

export type ChipTone = "fresh" | "soon" | "expired" | "unopened";

// אותם ארבעה גוונים משמשים גם לתוקף מוצרים וגם לתזכורות: בתוקף / מתקרב /
// עבר / עוד לא התחיל.
export const REMINDER_TONE: Record<ReminderStatus, ChipTone> = {
  ok: "fresh",
  due_soon: "soon",
  overdue: "expired",
  never_done: "unopened",
};

export function expiryTone(status: ExpiryStatus): ChipTone {
  return status;
}

export default function StatusChip({
  tone,
  children,
}: {
  tone: ChipTone;
  children: ReactNode;
}) {
  return (
    <span className="skn-chip" data-tone={tone}>
      {children}
    </span>
  );
}
