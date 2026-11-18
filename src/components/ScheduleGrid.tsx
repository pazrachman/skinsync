"use client";

import { parseISO } from "date-fns";
import { useActionState, useMemo, useRef, useState, useTransition } from "react";
import { Droplet, TriangleAlert, X } from "lucide-react";
import Checkbox from "@/components/Checkbox";
import EmptyState from "@/components/EmptyState";
import InlineError from "@/components/InlineError";
import PageHeader from "@/components/PageHeader";
import { conflictText } from "@/components/TodayRoutine";
import { completionKey, useCompletionToggle } from "@/components/useCompletionToggle";
import { addScheduleItem, deleteScheduleItem, type ScheduleFormState } from "@/lib/actions/schedule";
import { ERR_NETWORK } from "@/lib/errors";
import { findConflicts } from "@/lib/ingredients";
import type { Product, ScheduleCompletion, ScheduleItem, TimeOfDay } from "@/lib/types";

const DAY_LABELS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const SLOTS: { key: TimeOfDay; label: string }[] = [
  { key: "morning", label: "בוקר" },
  { key: "evening", label: "ערב" },
];

const initialState: ScheduleFormState = { error: null };

function AddScheduleItemForm({ products, onDone }: { products: Product[]; onDone: () => void }) {
  // סוגרים את הטופס רק אם השמירה הצליחה — אחרת השגיאה נשארת גלויה
  const [state, formAction, pending] = useActionState(
    async (prev: ScheduleFormState, fd: FormData) => {
      const result = await addScheduleItem(prev, fd);
      if (!result.error) onDone();
      return result;
    },
    initialState
  );
  const daysContainerRef = useRef<HTMLDivElement>(null);

  function selectAllDays() {
    daysContainerRef.current
      ?.querySelectorAll<HTMLInputElement>('input[name="days_of_week"]')
      .forEach((checkbox) => {
        checkbox.checked = true;
      });
  }

  return (
    <form action={formAction} className="skn-card skn-form mb-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="skn-field">
          <label className="skn-label" htmlFor="schedule-product">
            מוצר / מכשיר
          </label>
          <select id="schedule-product" name="product_id" required className="skn-input">
            <option value="">בחרי מוצר...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.brand ? ` · ${p.brand}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="skn-field">
          <span className="skn-label">זמן ביום</span>
          <div className="flex flex-wrap gap-x-5 gap-y-1 pt-1.5">
            {SLOTS.map((slot) => (
              <Checkbox
                key={slot.key}
                variant="box"
                name="time_of_day"
                value={slot.key}
                defaultChecked={slot.key === "morning"}
                label={slot.label}
                labelClassName="text-[0.9375rem]"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="skn-field">
        <div className="flex items-center justify-between">
          <span className="skn-label">ימים בשבוע</span>
          <button type="button" onClick={selectAllDays} className="skn-link text-sm">
            בחירת כל הימים
          </button>
        </div>
        <div ref={daysContainerRef} className="flex flex-wrap gap-x-5 gap-y-1">
          {DAY_LABELS.map((label, idx) => (
            <Checkbox
              key={idx}
              variant="box"
              name="days_of_week"
              value={idx}
              label={label}
              labelClassName="text-[0.9375rem]"
            />
          ))}
        </div>
      </div>

      <InlineError message={state.error} />

      <div className="skn-form-actions">
        <button type="submit" disabled={pending} className="skn-btn skn-btn-primary">
          {pending ? "משבצת..." : "שיבוץ"}
        </button>
        <button type="button" onClick={onDone} className="skn-btn skn-btn-ghost">
          ביטול
        </button>
      </div>
    </form>
  );
}

function weekRange(weekDates: string[]) {
  const first = parseISO(weekDates[0]);
  const last = parseISO(weekDates[6]);
  const month = (d: Date) => d.toLocaleDateString("he-IL", { month: "long" });
  return month(first) === month(last)
    ? `${first.getDate()}–${last.getDate()} ב${month(last)}`
    : `${first.getDate()} ב${month(first)} – ${last.getDate()} ב${month(last)}`;
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
  const serverDoneKeys = useMemo(
    () => new Set(completions.map((c) => completionKey(c.schedule_item_id, c.completed_on))),
    [completions]
  );
  const { isDone, toggle, error, setError } = useCompletionToggle(serverDoneKeys);
  const [, startDelete] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const todayIso = new Date().toISOString().slice(0, 10);

  function handleDelete(id: string) {
    setError(null);
    startDelete(async () => {
      try {
        const result = await deleteScheduleItem(id);
        if (result.error) setError(result.error);
      } catch {
        setError(ERR_NETWORK);
      }
    });
  }

  return (
    <div>
      <PageHeader
        eyebrow={weekRange(weekDates)}
        title="שגרה שבועית"
        actions={
          !formOpen && (
            <button type="button" onClick={() => setFormOpen(true)} className="skn-btn skn-btn-primary">
              שיבוץ מוצר
            </button>
          )
        }
      />

      {formOpen && <AddScheduleItemForm products={products} onDone={() => setFormOpen(false)} />}

      <div className="mb-4">
        <InlineError message={error} onDismiss={() => setError(null)} />
      </div>

      {scheduleItems.length === 0 && (
        <div className="mb-6">
          <EmptyState icon={Droplet}>
            עדיין לא שיבצת מוצרים לשגרה. השתמשי ב&ldquo;שיבוץ מוצר&rdquo; כדי להתחיל.
          </EmptyState>
        </div>
      )}

      <div className="skn-legend" aria-hidden>
        <span>
          <i style={{ background: "var(--color-skn-serum)" }} />
          בוקר
        </span>
        <span>
          <i style={{ background: "var(--color-skn-dusk)" }} />
          ערב
        </span>
      </div>

      <div className="skn-week">
        {weekDates.map((date, dayIdx) => {
          const isToday = date === todayIso;
          const dayItems = scheduleItems.filter((it) => it.days_of_week.includes(dayIdx));
          const dayDone = dayItems.filter((it) => isDone(it.id, date)).length;

          return (
            <section
              key={date}
              className="skn-card skn-day"
              data-today={isToday || undefined}
              aria-label={`${DAY_LABELS[dayIdx]}${isToday ? " (היום)" : ""}`}
            >
              <div>
                <p className="skn-day-name">
                  <span>{DAY_LABELS[dayIdx]}</span>
                  {isToday && <span className="text-skn-ink">היום</span>}
                </p>
                <p className="skn-day-date mt-1">{parseISO(date).getDate()}</p>
              </div>

              <div className="skn-day-progress" aria-hidden>
                <span
                  style={{
                    width: dayItems.length ? `${Math.round((dayDone / dayItems.length) * 100)}%` : "0%",
                  }}
                />
              </div>
              {dayItems.length > 0 && (
                <p className="sr-only">
                  {dayDone} מתוך {dayItems.length} הושלמו
                </p>
              )}

              {dayItems.length === 0 && <p className="skn-day-rest">אין מוצרים משובצים</p>}

              {SLOTS.map((slot) => {
                const items = dayItems.filter((it) => it.time_of_day === slot.key);
                if (items.length === 0) return null;
                const conflicts = findConflicts(items.flatMap((it) => it.product?.active_ingredients ?? []));

                return (
                  <div key={slot.key} className="skn-day-group" aria-label={slot.label} role="group">
                    {items.map((item) => (
                      <div key={item.id} className="skn-day-item">
                        <Checkbox
                          variant="dot"
                          slot={slot.key}
                          checked={isDone(item.id, date)}
                          onChange={() => toggle(item.id, date)}
                          label={item.product?.name ?? "מוצר נמחק"}
                        />
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="skn-day-remove"
                          title="הסרה מהשגרה"
                          aria-label={`הסרת ${item.product?.name ?? "המוצר"} מהשגרה`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}

                    {conflicts.map((c, i) => (
                      <p key={i} className="skn-warning mt-1.5">
                        <TriangleAlert aria-hidden />
                        <span>{conflictText(c)}</span>
                      </p>
                    ))}
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </div>
  );
}
