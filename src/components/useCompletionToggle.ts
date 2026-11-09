"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toggleCompletion } from "@/lib/actions/schedule";
import { ERR_NETWORK } from "@/lib/errors";

export function completionKey(scheduleItemId: string, date: string) {
  return `${scheduleItemId}_${date}`;
}

/**
 * סימון V אופטימי: ה-checkbox מתעדכן מיד, אבל רק כל עוד הפעולה רצה.
 * - הצלחה: ה-Server Action קורא ל-revalidatePath, והעמוד מקבל props חדשים
 *   מהשרת (עם הסימון השמור) באותו transition — אין קפיצה.
 * - כישלון: useOptimistic חוזר אוטומטית לערך שהגיע מהשרת (כלומר הסימון
 *   מתבטל), ומוצגת הודעת שגיאה. לא מציגים "נשמר" כשהשמירה נכשלה.
 */
export function useCompletionToggle(serverDoneKeys: Set<string>) {
  const [doneKeys, setOptimisticDone] = useOptimistic(
    serverDoneKeys,
    (current, change: { key: string; done: boolean }) => {
      const next = new Set(current);
      if (change.done) next.add(change.key);
      else next.delete(change.key);
      return next;
    }
  );
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function isDone(scheduleItemId: string, date: string) {
    return doneKeys.has(completionKey(scheduleItemId, date));
  }

  function toggle(scheduleItemId: string, date: string) {
    const key = completionKey(scheduleItemId, date);
    const wasDone = doneKeys.has(key);
    setError(null);

    startTransition(async () => {
      setOptimisticDone({ key, done: !wasDone });
      try {
        const result = await toggleCompletion(scheduleItemId, date, wasDone);
        if (result?.error) setError(result.error);
      } catch {
        setError(ERR_NETWORK);
      }
    });
  }

  return { isDone, toggle, error, setError };
}
