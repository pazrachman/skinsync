"use client";

import { useMemo } from "react";
import { Droplet, Moon, Sun, TriangleAlert } from "lucide-react";
import Checkbox from "@/components/Checkbox";
import EmptyState from "@/components/EmptyState";
import InlineError from "@/components/InlineError";
import { completionKey, useCompletionToggle } from "@/components/useCompletionToggle";
import { findConflicts, INGREDIENT_LABELS, type ConflictWarning } from "@/lib/ingredients";
import type { ScheduleItem, TimeOfDay } from "@/lib/types";

const SLOTS: { key: TimeOfDay; label: string; icon: typeof Sun; empty: string }[] = [
  { key: "morning", label: "בוקר", icon: Sun, empty: "אין מוצרים לבוקר היום." },
  { key: "evening", label: "ערב", icon: Moon, empty: "אין מוצרים לערב היום." },
];

// רוב ההסברים כבר פותחים בשמות הרכיבים — מוסיפים את הצמד רק כשהוא חסר.
export function conflictText(c: ConflictWarning) {
  const a = INGREDIENT_LABELS[c.a];
  const b = INGREDIENT_LABELS[c.b];
  return c.reason.includes(a) ? c.reason : `${a} + ${b}: ${c.reason}`;
}

export default function TodayRoutine({
  items,
  completedIds,
  date,
}: {
  items: ScheduleItem[];
  completedIds: Set<string>;
  date: string;
}) {
  const serverDoneKeys = useMemo(
    () => new Set([...completedIds].map((id) => completionKey(id, date))),
    [completedIds, date]
  );
  const { isDone, toggle, error, setError } = useCompletionToggle(serverDoneKeys);

  if (items.length === 0) {
    return (
      <EmptyState icon={Droplet}>
        אין פריטים משובצים להיום. אפשר להוסיף בעמוד &ldquo;שגרה שבועית&rdquo;.
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <InlineError message={error} onDismiss={() => setError(null)} />
      <div className="skn-card skn-routine">
        {SLOTS.map((slot) => {
          const slotItems = items.filter((it) => it.time_of_day === slot.key);
          const done = slotItems.filter((it) => isDone(it.id, date)).length;
          const conflicts = findConflicts(
            slotItems.flatMap((it) => it.product?.active_ingredients ?? [])
          );
          const Icon = slot.icon;

          return (
            <section key={slot.key} className="skn-routine-col" aria-label={slot.label}>
              <div className="skn-routine-head">
                <span className="skn-slot-icon" data-slot={slot.key}>
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <h3 className="text-[1.05rem] font-semibold tracking-[-0.01em]">{slot.label}</h3>
                {slotItems.length > 0 && (
                  <span className="skn-num ms-auto text-sm text-skn-muted">
                    {done} מתוך {slotItems.length}
                  </span>
                )}
              </div>

              {slotItems.length === 0 ? (
                <p className="text-[0.9375rem] text-skn-muted">{slot.empty}</p>
              ) : (
                <ul className="skn-routine-list">
                  {slotItems.map((item) => {
                    const noteId = `note-${item.id}`;
                    const note = item.product?.brand;
                    return (
                      <li key={item.id}>
                        <Checkbox
                          checked={isDone(item.id, date)}
                          onChange={() => toggle(item.id, date)}
                          label={item.product?.name ?? "מוצר נמחק"}
                          aria-describedby={note ? noteId : undefined}
                          labelClassName="text-[0.9375rem]"
                        />
                        {note && (
                          <p id={noteId} className="skn-routine-note">
                            {note}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              {conflicts.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {conflicts.map((c, i) => (
                    <p key={i} className="skn-warning">
                      <TriangleAlert aria-hidden />
                      <span>{conflictText(c)}</span>
                    </p>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
