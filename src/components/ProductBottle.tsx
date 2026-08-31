import type { ExpiryStatus } from "@/lib/types";
import type { ProductShape } from "@/lib/productCategories";
import { categorizeDevice } from "@/lib/productCategories";

const STATUS_BODY: Record<ExpiryStatus, string> = {
  fresh: "bg-skn-sage/20 border-skn-sage/45",
  soon: "bg-skn-honey/20 border-skn-honey/45",
  expired: "bg-skn-berry/15 border-skn-berry/45",
  unopened: "bg-skn-sand/50 border-skn-sand",
};

// לגוף הבקבוק המעוצב (עם טייפר בכתפיים) אין border אחיד לאורך הקצוות
// האלכסוניים, אז הוא משתמש רק ברקע, בלי מסגרת.
const STATUS_GLASS: Record<ExpiryStatus, string> = {
  fresh: "bg-skn-sage/25",
  soon: "bg-skn-honey/25",
  expired: "bg-skn-berry/20",
  unopened: "bg-skn-sand/55",
};

const NEUTRAL_BODY = "bg-skn-sand/40 border-skn-sand";

function Label({ name }: { name: string }) {
  return (
    <span className="relative line-clamp-3 w-full rounded-md bg-white/95 px-1.5 py-1 text-center text-[10px] font-semibold leading-tight text-skn-ink shadow-sm">
      {name}
    </span>
  );
}

function Caption({ name }: { name: string }) {
  return (
    <span className="line-clamp-2 w-full max-w-[5.5rem] text-center text-[10px] font-medium leading-tight text-skn-ink/70">
      {name}
    </span>
  );
}

// בקבוקון סרום אמיתי: כתפיים מצטמצמות לצוואר, מכסה טפטפת כהה עם רקע
// כפול לזכוכית מבריקה — לא סתם קופסה עגולה עם מכסה שטוח.
function SerumBottle({ name, status }: { name: string; status: ExpiryStatus }) {
  return (
    <div className="flex w-24 shrink-0 flex-col items-center" aria-hidden>
      {/* בועת הטפטפת */}
      <div className="h-3 w-6 rounded-t-full bg-skn-ink/85" />
      {/* טבעת מותג דקה */}
      <div className="h-1 w-7 bg-skn-pink-deep" />
      {/* צווארון המכסה */}
      <div className="h-2 w-6 bg-skn-ink/75" />
      {/* צוואר זכוכית */}
      <div className="h-2.5 w-4 bg-skn-ink/10" />
      {/* כתפיים + גוף — טייפר יחיד עם פינות תחתונות מעוגלות */}
      <div
        className={`relative flex h-28 w-20 flex-col items-center justify-center px-1.5 ${STATUS_GLASS[status]}`}
        style={{
          clipPath:
            "polygon(38% 0%, 62% 0%, 100% 16%, 100% 100%, 0% 100%, 0% 16%)",
          borderBottomLeftRadius: "1.6rem",
          borderBottomRightRadius: "1.6rem",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-5 h-14 w-1.5 rounded-full bg-white/40 blur-[0.5px]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute right-5 top-7 h-8 w-0.5 rounded-full bg-white/70"
        />
        <Label name={name} />
      </div>
    </div>
  );
}

function Jar({ name, status }: { name: string; status: ExpiryStatus }) {
  return (
    <div className="flex w-24 shrink-0 flex-col items-center" aria-hidden>
      {/* מכסה שטוח ורחב */}
      <div className="h-3 w-20 rounded-t-lg bg-skn-pink-deep" />
      <div
        className={`relative flex h-16 w-full flex-col items-center justify-center rounded-2xl border px-1.5 ${STATUS_BODY[status]}`}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute right-2.5 top-2 h-9 w-1 rounded-full bg-white/50"
        />
        <Label name={name} />
      </div>
    </div>
  );
}

// צורת מסכת פנים (כמו מסכת בד) — קו מתאר של פנים עם שני חורי עיניים.
// אותה צורה משמשת גם למדף "מסכות" וגם למכשירי LED (שבפועל הם מסכות
// עם נקודות אור).
function FaceMask({
  toneClassName,
  withLights = false,
}: {
  toneClassName: string;
  withLights?: boolean;
}) {
  return (
    <div
      className={`relative flex h-20 w-16 items-start justify-center border px-2 pt-5 ${toneClassName}`}
      style={{ borderRadius: "48% 48% 42% 42% / 58% 58% 32% 32%" }}
    >
      {/* חורי עיניים */}
      <div className="flex gap-3">
        <span className="h-2.5 w-3.5 rounded-full bg-skn-ink/45" />
        <span className="h-2.5 w-3.5 rounded-full bg-skn-ink/45" />
      </div>
      {withLights && (
        <>
          <span className="absolute right-2.5 top-10 h-1.5 w-1.5 rounded-full bg-skn-pink-deep" />
          <span className="absolute left-2.5 top-10 h-1.5 w-1.5 rounded-full bg-skn-pink-deep" />
          <span className="absolute bottom-3 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-skn-pink-deep" />
        </>
      )}
    </div>
  );
}

// כל מכשיר מצויר לפי מה שהוא בפועל (מסכת LED, רולר, מברשת, גואה שה),
// לא סתם קופסה מעוגלת אחידה לכולם.
function Device({ name }: { name: string }) {
  const kind = categorizeDevice(name);

  if (kind === "led") {
    return (
      <div className="flex w-24 shrink-0 flex-col items-center gap-1.5" aria-hidden>
        <FaceMask toneClassName="border-skn-sand bg-skn-sand/40" withLights />
        <Caption name={name} />
      </div>
    );
  }

  if (kind === "roller") {
    return (
      <div className="flex w-24 shrink-0 flex-col items-center gap-1.5" aria-hidden>
        <div className="flex flex-col items-center">
          <div className="h-4 w-16 rounded-full border border-skn-sand bg-skn-sand/60" />
          <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-skn-ink/40" />
          <div className="h-9 w-1.5 rounded-full bg-skn-ink/25" />
        </div>
        <Caption name={name} />
      </div>
    );
  }

  if (kind === "brush") {
    return (
      <div className="flex w-24 shrink-0 flex-col items-center gap-1.5" aria-hidden>
        <div className="flex flex-col items-center">
          <div className="h-9 w-9 rounded-full border border-skn-sand bg-skn-sand/60" />
          <div className="h-8 w-1.5 rounded-full bg-skn-ink/25" />
        </div>
        <Caption name={name} />
      </div>
    );
  }

  if (kind === "guasha") {
    return (
      <div className="flex w-24 shrink-0 flex-col items-center gap-1.5" aria-hidden>
        <div
          className="h-10 w-14 border border-skn-sand bg-skn-sand/60"
          style={{ borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%" }}
        />
        <Caption name={name} />
      </div>
    );
  }

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

function MaskProduct({ name, status }: { name: string; status: ExpiryStatus }) {
  return (
    <div className="flex w-24 shrink-0 flex-col items-center gap-1.5" aria-hidden>
      <FaceMask toneClassName={STATUS_BODY[status]} />
      <Caption name={name} />
    </div>
  );
}

// בקבוקון/צנצנת/מסכה/מכשיר — לא סתם אייקון ליד הטקסט. הצורה משתנה לפי
// סוג המוצר (בקבוק לנוזלים, צנצנת לקרמים, מסכת פנים למסכות, ואצל
// מכשירים — לפי סוג המכשיר שמתואר בשם עצמו), הצבע לפי סטטוס התפוגה.
export default function ProductBottle({
  name,
  status,
  shape = "bottle",
}: {
  name: string;
  status: ExpiryStatus;
  shape?: ProductShape;
}) {
  if (shape === "jar") return <Jar name={name} status={status} />;
  if (shape === "device") return <Device name={name} />;
  if (shape === "facemask") return <MaskProduct name={name} status={status} />;
  return <SerumBottle name={name} status={status} />;
}
