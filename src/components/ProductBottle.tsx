import type { ExpiryStatus } from "@/lib/types";

const STATUS_BODY: Record<ExpiryStatus, string> = {
  fresh: "bg-skn-sage/20 border-skn-sage/45",
  soon: "bg-skn-honey/20 border-skn-honey/45",
  expired: "bg-skn-berry/15 border-skn-berry/45",
  unopened: "bg-skn-sand/50 border-skn-sand",
};

// בקבוקון אמיתי עם שם המוצר כתוב על התווית שלו — לא סתם אייקון ליד הטקסט.
// זה מה שבפועל "יושב על המדף" בארון הטיפוח.
export default function ProductBottle({
  name,
  status,
}: {
  name: string;
  status: ExpiryStatus;
}) {
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
        <span className="pointer-events-none absolute right-2.5 top-2 h-14 w-1 rounded-full bg-white/50" />
        <span className="relative line-clamp-3 w-full rounded-md bg-white/95 px-1.5 py-1 text-center text-[10px] font-semibold leading-tight text-skn-ink shadow-sm">
          {name}
        </span>
      </div>
    </div>
  );
}
