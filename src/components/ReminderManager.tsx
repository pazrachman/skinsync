"use client";

import { useActionState, useMemo, useState } from "react";
import { Droplet } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import ReminderList from "@/components/ReminderList";
import { upsertReminder, type ReminderFormState } from "@/lib/actions/reminders";
import { getReminderDueInfo } from "@/lib/expiry";
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
    <form action={formAction} className="skn-card skn-form mb-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="skn-field">
          <label className="skn-label" htmlFor="reminder-title">
            שם המשימה *
          </label>
          <input
            id="reminder-title"
            name="title"
            required
            placeholder="לדוגמה: חיטוי ציפית משי"
            className="skn-input"
          />
        </div>
        <div className="skn-field">
          <label className="skn-label" htmlFor="reminder-cadence">
            כל כמה ימים חוזרת
          </label>
          <input
            id="reminder-cadence"
            name="cadence_days"
            type="number"
            min={1}
            max={365}
            defaultValue={7}
            className="skn-input"
          />
        </div>
      </div>
      <div className="skn-field">
        <label className="skn-label" htmlFor="reminder-notes">
          הערות
        </label>
        <textarea
          id="reminder-notes"
          name="notes"
          rows={2}
          placeholder="לדוגמה: חומצה היפוכלורית מדוללת, לשטוף היטב אחרי 5 דק׳"
          className="skn-input"
        />
      </div>

      {state.error && (
        <p role="alert" className="skn-inline-error">
          {state.error}
        </p>
      )}

      <div className="skn-form-actions">
        <button type="submit" disabled={pending} className="skn-btn skn-btn-primary">
          {pending ? "שומר..." : "הוספת תזכורת"}
        </button>
        <button type="button" onClick={onDone} className="skn-btn skn-btn-ghost">
          ביטול
        </button>
      </div>
    </form>
  );
}

export default function ReminderManager({ reminders }: { reminders: MaintenanceReminder[] }) {
  const [formOpen, setFormOpen] = useState(false);

  const sorted = useMemo(
    () =>
      [...reminders].sort(
        (a, b) =>
          STATUS_ORDER[getReminderDueInfo(a).status] - STATUS_ORDER[getReminderDueInfo(b).status]
      ),
    [reminders]
  );

  const waiting = sorted.filter((r) => getReminderDueInfo(r).status !== "ok").length;
  const eyebrow = [`${reminders.length} תזכורות`, waiting > 0 && `${waiting} ממתינות`]
    .filter(Boolean)
    .join(" · ");

  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title="תזכורות"
        actions={
          !formOpen && (
            <button type="button" onClick={() => setFormOpen(true)} className="skn-btn skn-btn-primary">
              תזכורת חדשה
            </button>
          )
        }
      >
        <p className="skn-page-lede">
          משימות תחזוקה שאינן נמרחות ישירות על הפנים — למשל ניקוי מברשות איפור, חיטוי ציפית משי,
          או ניקוי מכשירי טיפוח.
        </p>
      </PageHeader>

      {formOpen && <ReminderForm onDone={() => setFormOpen(false)} />}

      {sorted.length === 0 && !formOpen && (
        <EmptyState icon={Droplet}>עדיין אין תזכורות תחזוקה. הוסיפי את הראשונה.</EmptyState>
      )}

      {sorted.length > 0 && <ReminderList reminders={sorted} allowDelete />}
    </div>
  );
}
