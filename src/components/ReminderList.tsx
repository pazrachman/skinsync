"use client";

import { useState, useTransition } from "react";
import InlineError from "@/components/InlineError";
import StatusChip, { REMINDER_TONE } from "@/components/StatusChip";
import { deleteReminder, markReminderDone } from "@/lib/actions/reminders";
import { ERR_NETWORK, type ActionResult } from "@/lib/errors";
import { getReminderDueInfo, REMINDER_STATUS_LABEL, type ReminderDueInfo } from "@/lib/expiry";
import type { MaintenanceReminder } from "@/lib/types";

function chipText(info: ReminderDueInfo) {
  const label = REMINDER_STATUS_LABEL[info.status];
  if (info.daysLeft === null) return label;
  return info.status === "overdue"
    ? `${label} · ${Math.abs(info.daysLeft)} ימים`
    : `${label} · בעוד ${info.daysLeft} ימים`;
}

export default function ReminderList({
  reminders,
  allowDelete = false,
}: {
  reminders: MaintenanceReminder[];
  allowDelete?: boolean;
}) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<ActionResult>) {
    setActionError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.error) setActionError(result.error);
      } catch {
        setActionError(ERR_NETWORK);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <InlineError message={actionError} onDismiss={() => setActionError(null)} />
      <ul className="skn-card skn-list">
        {reminders.map((r) => {
          const info = getReminderDueInfo(r);
          return (
            <li key={r.id} className="skn-reminder">
              <div className="skn-reminder-text">
                <p className="skn-reminder-title">{r.title}</p>
                <p className="skn-reminder-meta">
                  כל {r.cadence_days} ימים
                  {r.last_done_on
                    ? ` · בוצע לאחרונה ב-${new Date(r.last_done_on).toLocaleDateString("he-IL")}`
                    : " · עוד לא בוצע"}
                </p>
                {r.notes && <p className="skn-reminder-meta">{r.notes}</p>}
              </div>
              <div className="skn-reminder-chip">
                <StatusChip tone={REMINDER_TONE[info.status]}>{chipText(info)}</StatusChip>
              </div>
              <div className="skn-reminder-actions">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => markReminderDone(r.id))}
                  className="skn-btn skn-btn-secondary skn-btn-sm"
                >
                  בוצע היום
                </button>
                {allowDelete && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => deleteReminder(r.id))}
                    className="skn-btn skn-btn-quiet skn-btn-sm"
                  >
                    מחיקה
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
