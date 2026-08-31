"use client";

import { Droplet } from "lucide-react";
import Checkbox from "@/components/Checkbox";
import EmptyState from "@/components/EmptyState";
import { toggleCompletion } from "@/lib/actions/schedule";
import { findConflicts, INGREDIENT_LABELS } from "@/lib/ingredients";
import type { ScheduleItem, TimeOfDay } from "@/lib/types";

const SLOTS: { key: TimeOfDay; label: string }[] = [
  { key: "morning", label: "☀️ בוקר" },
  { key: "evening", label: "🌙 ערב" },
];

export default function TodayRoutine({
  items,
  completedIds,
  date,
}: {
  items: ScheduleItem[];
  completedIds: Set<string>;
  date: string;
}) {
  if (items.length === 0) {
    return (
      <EmptyState icon={Droplet}>
        אין פריטים משובצים להיום. אפשר להוסיף בעמוד &ldquo;שגרה שבועית&rdquo;.
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {SLOTS.map((slot) => {
        const slotItems = items.filter((it) => it.time_of_day === slot.key);
        if (slotItems.length === 0) return null;
        const conflicts = findConflicts(
          slotItems.flatMap((it) => it.product?.active_ingredients ?? [])
        );

        return (
          <div key={slot.key} className="flex flex-col gap-2 rounded-2xl border border-skn-sand bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-skn-ink/75">{slot.label}</p>
            <ul className="flex flex-col gap-1.5">
              {slotItems.map((item) => {
                const done = completedIds.has(item.id);
                return (
                  <li key={item.id}>
                    <Checkbox
                      checked={done}
                      onChange={() => toggleCompletion(item.id, date, done)}
                      label={item.product?.name ?? "מוצר נמחק"}
                      labelClassName={`text-sm ${done ? "text-skn-ink/35 line-through" : "text-skn-ink/80"}`}
                    />
                  </li>
                );
              })}
            </ul>
            {conflicts.length > 0 && (
              <div className="flex flex-col gap-1 rounded-lg border border-skn-honey/30 bg-skn-honey/10 px-2 py-1.5">
                {conflicts.map((c, i) => (
                  <p key={i} className="text-xs leading-snug text-skn-honey">
                    ⚠️ {INGREDIENT_LABELS[c.a]} + {INGREDIENT_LABELS[c.b]}: {c.reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
