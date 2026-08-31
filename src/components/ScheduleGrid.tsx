"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { Droplet } from "lucide-react";
import Checkbox from "@/components/Checkbox";
import EmptyState from "@/components/EmptyState";
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
  const daysContainerRef = useRef<HTMLDivElement>(null);

  function selectAllDays() {
    daysContainerRef.current
      ?.querySelectorAll<HTMLInputElement>('input[name="days_of_week"]')
      .forEach((checkbox) => {
        checkbox.checked = true;
      });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-skn-pink-deep px-4 py-2 text-sm font-semibold text-white transition hover:brightness-90"
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
      className="flex flex-col gap-3 rounded-2xl border border-skn-sand bg-white p-4 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-skn-ink/70">מוצר / מכשיר</label>
          <select
            name="product_id"
            required
            className="rounded-lg border border-skn-sand px-3 py-2 text-sm text-skn-ink focus:border-skn-pink focus:outline-none focus:ring-2 focus:ring-skn-pink/20"
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
          <label className="text-sm font-medium text-skn-ink/70">זמן ביום</label>
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-2">
            {SLOTS.map((slot) => (
              <Checkbox
                key={slot.key}
                name="time_of_day"
                value={slot.key}
                defaultChecked={slot.key === "morning"}
                label={slot.label}
                labelClassName="text-sm text-skn-ink/65"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-skn-ink/70">ימים בשבוע</label>
          <button
            type="button"
            onClick={selectAllDays}
            className="text-xs font-medium text-skn-pink-deep hover:underline"
          >
            בחר/י את כל הימים
          </button>
        </div>
        <div ref={daysContainerRef} className="flex flex-wrap gap-x-3 gap-y-1">
          {DAY_LABELS.map((label, idx) => (
            <Checkbox
              key={idx}
              name="days_of_week"
              value={idx}
              label={label}
              labelClassName="text-sm text-skn-ink/65"
            />
          ))}
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg bg-skn-berry/10 px-3 py-2 text-sm text-skn-berry">{state.error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-skn-pink-deep px-4 py-2 text-sm font-semibold text-white hover:brightness-90 disabled:opacity-60"
        >
          {pending ? "משבצת..." : "שיבוץ"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-skn-ink/55 hover:bg-skn-cream"
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
        <h1 className="font-display text-xl font-medium text-skn-ink">שגרה שבועית</h1>
        <AddScheduleItemForm products={products} />
      </div>

      {scheduleItems.length === 0 && (
        <EmptyState icon={Droplet}>
          עדיין לא שיבצת מוצרים לשגרה. השתמשי ב&ldquo;שיבוץ מוצר לשגרה&rdquo; כדי להתחיל.
        </EmptyState>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {weekDates.map((date, dayIdx) => (
          <div key={date} className="flex flex-col gap-2 rounded-2xl border border-skn-sand bg-white p-3 shadow-sm transition hover:shadow-md">
            <div className="text-center">
              <p className="text-sm font-semibold text-skn-ink">{DAY_LABELS[dayIdx]}</p>
              <p className="text-xs text-skn-ink/40">
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
                <div key={slot.key} className="flex flex-col gap-1.5 border-t border-skn-sand/60 pt-2 first:border-t-0 first:pt-0">
                  <p className="text-xs font-semibold text-skn-ink/45">{slot.label}</p>

                  {items.length === 0 && <p className="text-xs text-skn-ink/25">—</p>}

                  {items.map((item) => {
                    const key = `${item.id}_${date}`;
                    const done = completedSet.has(key);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-1 rounded-lg bg-skn-cream px-2 py-1"
                      >
                        <Checkbox
                          checked={done}
                          onChange={() => toggleCompletion(item.id, date, done)}
                          className="flex-1"
                          label={item.product?.name ?? "מוצר נמחק"}
                          labelClassName={`text-xs ${done ? "text-skn-ink/35 line-through" : "text-skn-ink/75"}`}
                        />
                        <button
                          onClick={() => deleteScheduleItem(item.id)}
                          className="shrink-0 text-xs text-skn-ink/25 hover:text-skn-berry"
                          title="הסרה מהשגרה"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}

                  {conflicts.length > 0 && (
                    <div className="flex flex-col gap-1 rounded-lg border border-skn-honey/30 bg-skn-honey/10 px-2 py-1.5">
                      {conflicts.map((c, i) => (
                        <p key={i} className="text-[11px] leading-snug text-skn-honey">
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
