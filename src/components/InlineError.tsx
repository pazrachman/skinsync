"use client";

import { X } from "lucide-react";

// הודעת שגיאה קטנה לפעולה שנכשלה. role="alert" כדי שקוראי מסך יכריזו עליה.
export default function InlineError({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss?: () => void;
}) {
  if (!message) return null;
  return (
    <div role="alert" className="skn-inline-error">
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="סגירת הודעת השגיאה"
          className="shrink-0 rounded-full opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
