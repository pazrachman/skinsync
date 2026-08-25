"use client";

import { useActionState, useMemo, useState } from "react";
import {
  addScheduleItem,
  deleteScheduleItem,
  toggleCompletion,
  type ScheduleFormState,
} from "@/lib/actions/schedule";
import { findConflicts } from "@/lib/ingredients";
import { INGREDIENT_LABELS } from "@/lib/ingredients";
import type { Product, ScheduleCompletion, ScheduleItem, TimeOfDay } from "@/lib/types";

const DAY_LABELS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const SLOTS: { key: TimeOfDay; label: string }[] = [
  { key: "morning", label: "בוקר" },
  { key: "evening", label: "ערב" },
];

const initialState: ScheduleFormState = { error: null };

function AddScheduleItemForm({ products }: { products: Product[] }) {
  const [state, formAction, pending] = useActionState(addScheduleItem, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
      >
        + שיבוץ מוצר לשגרה
      </button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await formAction(fd);
        setOpen(false);
      }}
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">מוצר / מכשיר</label>
          <select
            name="product_id"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          >
            <option value="">בחרי מוצר...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.brand ? ` · ${p.brand}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">זמן ביום</label>
          <select
            name="time_of_day"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          >
            <option value="morning">בוקר</option>
            <option value="evening">ערב</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">ימים בשבוע</label>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {DAY_LABELS.map((label, idx) => (
            <label key={idx} className="flex items-center gap-1.5 text-sm text-slate-600">
              <input type="checkbox" name="days_of_week" value={idx} />
              {label}
            </label>
          ))}
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
        >
          {pending ? "משבצת..." : "שיבוץ"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}

export default function ScheduleGrid({
  products,
  scheduleItems,
  completions,
  weekDates,
}: {
  products: Product[];
  scheduleItems: ScheduleItem[];
  completions: ScheduleCompletion[];
  weekDates: string[];
}) {
  const completedSet = useMemo(
    () => new Set(completions.map((c) => `${c.schedule_item_id}_${c.completed_on}`)),
    [completions]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">שגרה שבועית</h1>
        <AddScheduleItemForm products={products} />
      </div>

      {scheduleItems.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          עדיין לא שיבצת מוצרים לשגרה. השתמשי ב&ldquo;שיבוץ מוצר לשגרה&rdquo; כדי להתחיל.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {weekDates.map((date, dayIdx) => (
          <div key={date} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-900">{DAY_LABELS[dayIdx]}</p>
              <p className="text-xs text-slate-400">
                {new Date(date).toLocaleDateString("he-IL", { day: "numeric", month: "numeric" })}
              </p>
            </div>

            {SLOTS.map((slot) => {
              const items = scheduleItems.filter(
                (it) => it.time_of_day === slot.key && it.days_of_week.includes(dayIdx)
              );
              const conflicts = findConflicts(
                items.flatMap((it) => it.product?.active_ingredients ?? [])
              );

              return (
                <div key={slot.key} className="flex flex-col gap-1.5 border-t border-slate-100 pt-2 first:border-t-0 first:pt-0">
                  <p className="text-xs font-semibold text-slate-400">{slot.label}</p>

                  {items.length === 0 && <p className="text-xs text-slate-300">—</p>}

                  {items.map((item) => {
                    const key = `${item.id}_${date}`;
                    const done = completedSet.has(key);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-1 rounded-lg bg-slate-50 px-2 py-1"
                      >
                        <label className="flex flex-1 items-center gap-1.5 text-xs text-slate-700">
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={() => toggleCompletion(item.id, date, done)}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-rose-500 focus:ring-rose-400"
                          />
                          <span className={done ? "text-slate-400 line-through" : ""}>
                            {item.product?.name ?? "מוצר נמחק"}
                          </span>
                        </label>
                        <button
                          onClick={() => deleteScheduleItem(item.id)}
                          className="shrink-0 text-xs text-slate-300 hover:text-rose-500"
                          title="הסרה מהשגרה"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}

                  {conflicts.length > 0 && (
                    <div className="flex flex-col gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1.5">
                      {conflicts.map((c, i) => (
                        <p key={i} className="text-[11px] leading-snug text-amber-800">
                          ⚠️ {INGREDIENT_LABELS[c.a]} + {INGREDIENT_LABELS[c.b]}: {c.reason}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
