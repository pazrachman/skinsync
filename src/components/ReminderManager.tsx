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
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">שם המשימה *</label>
          <input
            name="title"
            required
            placeholder="לדוגמה: חיטוי ציפית משי"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">כל כמה ימים חוזרת</label>
          <input
            name="cadence_days"
            type="number"
            min={1}
            max={365}
            defaultValue={7}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">הערות</label>
        <textarea
          name="notes"
          rows={2}
          placeholder="לדוגמה: חומצה היפוכלורית מדוללת, לשטוף היטב אחרי 5 דק׳"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
        />
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
          {pending ? "שומר..." : "הוספת תזכורת"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
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
        <h1 className="text-xl font-bold text-slate-900">תזכורות תחזוקה והיגיינה</h1>
        {!formOpen && (
          <button
            onClick={() => setFormOpen(true)}
            className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
          >
            + תזכורת חדשה
          </button>
        )}
      </div>

      <p className="text-sm text-slate-500">
        משימות תחזוקה שאינן נמרחות ישירות על הפנים — למשל ניקוי מברשות איפור, חיטוי ציפית
        משי, או ניקוי מכשירי טיפוח.
      </p>

      {formOpen && <ReminderForm onDone={() => setFormOpen(false)} />}

      {sorted.length === 0 && !formOpen && (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          עדיין אין תזכורות תחזוקה. הוסיפי את הראשונה.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {sorted.map((r) => {
          const info = getReminderDueInfo(r);
          return (
            <li
              key={r.id}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900">{r.title}</span>
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
                <p className="text-xs text-slate-400">
                  כל {r.cadence_days} ימים
                  {r.last_done_on &&
                    ` · בוצע לאחרונה ב-${new Date(r.last_done_on).toLocaleDateString("he-IL")}`}
                </p>
                {r.notes && <p className="text-sm text-slate-500">{r.notes}</p>}
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => markReminderDone(r.id)}
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  בוצע היום
                </button>
                <button
                  onClick={() => deleteReminder(r.id)}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50"
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
