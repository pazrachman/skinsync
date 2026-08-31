import type { ExpiryStatus } from "@/lib/types";
import type { ProductShape } from "@/lib/productCategories";

const STATUS_BODY: Record<ExpiryStatus, string> = {
  fresh: "bg-skn-sage/20 border-skn-sage/45",
  soon: "bg-skn-honey/20 border-skn-honey/45",
  expired: "bg-skn-berry/15 border-skn-berry/45",
  unopened: "bg-skn-sand/50 border-skn-sand",
};

const NEUTRAL_BODY = "bg-skn-sand/40 border-skn-sand";

function Label({ name }: { name: string }) {
  return (
    <span className="relative line-clamp-3 w-full rounded-md bg-white/95 px-1.5 py-1 text-center text-[10px] font-semibold leading-tight text-skn-ink shadow-sm">
      {name}
    </span>
  );
}

function Glint({ className = "h-14" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute right-2.5 top-2 w-1 rounded-full bg-white/50 ${className}`}
    />
  );
}

// בקבוקון/צנצנת/מכשיר אמיתיים עם שם המוצר כתוב על התווית — לא סתם
// אייקון ליד הטקסט. הצורה משתנה לפי סוג המוצר (בקבוק לנוזלים, צנצנת
// לקרמים, מכשיר למכשירים), הצבע לפי סטטוס התפוגה.
export default function ProductBottle({
  name,
  status,
  shape = "bottle",
}: {
  name: string;
  status: ExpiryStatus;
  shape?: ProductShape;
}) {
  if (shape === "jar") {
    return (
      <div className="flex w-24 shrink-0 flex-col items-center" aria-hidden>
        {/* מכסה שטוח ורחב */}
        <div className="h-3 w-20 rounded-t-lg bg-skn-pink-deep" />
        <div
          className={`relative flex h-16 w-full flex-col items-center justify-center rounded-2xl border px-1.5 ${STATUS_BODY[status]}`}
        >
          <Glint className="h-9" />
          <Label name={name} />
        </div>
      </div>
    );
  }

  if (shape === "device") {
    return (
      <div className="flex w-24 shrink-0 flex-col items-center" aria-hidden>
        <div
          className={`relative flex h-24 w-20 flex-col items-center justify-center gap-2 rounded-[1.4rem] border px-1.5 ${NEUTRAL_BODY}`}
        >
          <span className="absolute top-2.5 h-2 w-2 rounded-full bg-skn-pink-deep" />
          <Label name={name} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-24 shrink-0 flex-col items-center" aria-hidden>
      {/* מכסה */}
      <div className="h-4 w-11 rounded-t-md bg-skn-pink-deep" />
      {/* צוואר */}
      <div className="h-3 w-6 bg-skn-ink/15" />
      {/* גוף + תווית */}
      <div
        className={`relative flex h-24 w-full flex-col items-center justify-center rounded-2xl rounded-b-[1.5rem] border px-1.5 ${STATUS_BODY[status]}`}
      >
        <Glint />
        <Label name={name} />
      </div>
    </div>
  );
}
