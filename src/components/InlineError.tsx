"use client";

import { X } from "lucide-react";

// הודעת שגיאה קטנה לפעולה שנכשלה (סימון V, מחיקה וכו'). role="alert" כדי
// שקוראי מסך יכריזו עליה מיד.
export default function InlineError({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss?: () => void;
}) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-2 rounded-lg bg-skn-berry/10 px-3 py-2 text-sm text-skn-berry"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="סגירת הודעת השגיאה"
          className="shrink-0 text-skn-berry/60 hover:text-skn-berry"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
