"use client";

import { useActionState, useMemo, useState } from "react";
import {
  deleteReminder,
  markReminderDone,
  upsertReminder,
  type ReminderFormState,
} from "@/lib/actions/reminders";
import {
  REMINDER_STATUS_COLOR,
  REMINDER_STATUS_LABEL,
  getReminderDueInfo,
} from "@/lib/expiry";
import type { MaintenanceReminder } from "@/lib/types";

const initialState: ReminderFormState = { error: null };
const STATUS_ORDER: Record<string, number> = {
  overdue: 0,
  due_soon: 1,
  never_done: 2,
  ok: 3,
};

function ReminderForm({ onDone }: { onDone: () => void }) {
  const [state, formAction, pending] = useActionState(upsertReminder, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl border border-skn-sand bg-white p-4 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-skn-ink/70">שם המשימה *</label>
          <input
            name="title"
            required
            placeholder="לדוגמה: חיטוי ציפית משי"
            className="rounded-lg border border-skn-sand px-3 py-2 text-sm text-skn-ink focus:border-skn-pink focus:outline-none focus:ring-2 focus:ring-skn-pink/20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-skn-ink/70">כל כמה ימים חוזרת</label>
          <input
            name="cadence_days"
            type="number"
            min={1}
            max={365}
            defaultValue={7}
            className="rounded-lg border border-skn-sand px-3 py-2 text-sm text-skn-ink focus:border-skn-pink focus:outline-none focus:ring-2 focus:ring-skn-pink/20"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-skn-ink/70">הערות</label>
        <textarea
          name="notes"
          rows={2}
          placeholder="לדוגמה: חומצה היפוכלורית מדוללת, לשטוף היטב אחרי 5 דק׳"
          className="rounded-lg border border-skn-sand px-3 py-2 text-sm text-skn-ink focus:border-skn-pink focus:outline-none focus:ring-2 focus:ring-skn-pink/20"
        />
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
          {pending ? "שומר..." : "הוספת תזכורת"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg px-4 py-2 text-sm font-medium text-skn-ink/55 hover:bg-skn-cream"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}

export default function ReminderManager({
  reminders,
}: {
  reminders: MaintenanceReminder[];
}) {
  const [formOpen, setFormOpen] = useState(false);

  const sorted = useMemo(
    () =>
      [...reminders].sort(
        (a, b) => STATUS_ORDER[getReminderDueInfo(a).status] - STATUS_ORDER[getReminderDueInfo(b).status]
      ),
    [reminders]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-medium text-skn-ink">תזכורות תחזוקה והיגיינה</h1>
        {!formOpen && (
          <button
            onClick={() => setFormOpen(true)}
            className="rounded-xl bg-skn-pink-deep px-4 py-2 text-sm font-semibold text-white transition hover:brightness-90"
          >
            + תזכורת חדשה
          </button>
        )}
      </div>

      <p className="text-sm text-skn-ink/55">
        משימות תחזוקה שאינן נמרחות ישירות על הפנים — למשל ניקוי מברשות איפור, חיטוי ציפית
        משי, או ניקוי מכשירי טיפוח.
      </p>

      {formOpen && <ReminderForm onDone={() => setFormOpen(false)} />}

      {sorted.length === 0 && !formOpen && (
        <p className="rounded-2xl border border-dashed border-skn-sand bg-white p-8 text-center text-sm text-skn-ink/55">
          עדיין אין תזכורות תחזוקה. הוסיפי את הראשונה.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {sorted.map((r) => {
          const info = getReminderDueInfo(r);
          return (
            <li
              key={r.id}
              className="flex flex-col gap-2 rounded-2xl border border-skn-sand bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-skn-ink">{r.title}</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${REMINDER_STATUS_COLOR[info.status]}`}
                  >
                    {REMINDER_STATUS_LABEL[info.status]}
                    {info.daysLeft !== null &&
                      (info.status === "overdue"
                        ? ` · באיחור של ${Math.abs(info.daysLeft)} ימים`
                        : ` · בעוד ${info.daysLeft} ימים`)}
                  </span>
                </div>
                <p className="text-xs text-skn-ink/40">
                  כל {r.cadence_days} ימים
                  {r.last_done_on &&
                    ` · בוצע לאחרונה ב-${new Date(r.last_done_on).toLocaleDateString("he-IL")}`}
                </p>
                {r.notes && <p className="text-sm text-skn-ink/55">{r.notes}</p>}
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => markReminderDone(r.id)}
                  className="rounded-lg border border-skn-sage/30 bg-skn-sage/10 px-3 py-1.5 text-xs font-medium text-skn-sage hover:bg-skn-sage/20"
                >
                  בוצע היום
                </button>
                <button
                  onClick={() => deleteReminder(r.id)}
                  className="rounded-lg border border-skn-berry/30 px-3 py-1.5 text-xs font-medium text-skn-berry hover:bg-skn-berry/10"
                >
                  מחיקה
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
