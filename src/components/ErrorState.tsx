import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { ERR_LOAD_FAILED } from "@/lib/errors";

// מצב שגיאה בעמוד שלם — כשהקריאה מבסיס הנתונים נכשלה. חשוב שזה ייראה
// שונה לגמרי מ-EmptyState: "אין לך נתונים" ו"לא הצלחנו לטעון" הם שני
// מצבים שונים, ובלבול ביניהם גורם למשתמשת לחשוב שהמידע שלה נמחק.
export default function ErrorState({
  title = "משהו השתבש",
  children = ERR_LOAD_FAILED,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-skn-berry/30 bg-skn-berry/5 p-8 text-center text-sm text-skn-berry"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-skn-berry/10">
        <TriangleAlert className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <p className="font-semibold">{title}</p>
      <p className="text-skn-ink/60">{children}</p>
    </div>
  );
}
