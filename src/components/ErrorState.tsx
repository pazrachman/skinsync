import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { ERR_LOAD_FAILED } from "@/lib/errors";

// מצב שגיאה בעמוד שלם — חייב להיראות שונה לגמרי מ-EmptyState: "אין לך
// נתונים" ו"לא הצלחנו לטעון" הם שני מצבים שונים.
export default function ErrorState({
  title = "משהו השתבש",
  children = ERR_LOAD_FAILED,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div role="alert" className="skn-error-state">
      <TriangleAlert className="h-5 w-5" strokeWidth={1.75} />
      <p className="font-semibold">{title}</p>
      <p className="text-skn-ink">{children}</p>
    </div>
  );
}
