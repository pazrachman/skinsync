// ולידציה טהורה (ללא תלות ב-Supabase/Next) — כדי שאפשר יהיה לבדוק אותה
// ישירות, וכדי שה-Server Actions ישתמשו בדיוק באותם כללים.

/** יום בשבוע תקין: מספר שלם (לא string, לא NaN, לא שבר) בין 0 (ראשון) ל-6 (שבת). */
export function isValidWeekday(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 6;
}

/**
 * ערכי FormData תמיד מגיעים כ-string, לכן ממירים רק את הייצוג הקנוני "0".."6"
 * (בלי רווחים, בלי "3.0"/"03"/"NaN"/""), ואז מוודאים שוב עם isValidWeekday.
 * מחזיר null אם הערך לא תקין.
 */
export function parseWeekdayField(raw: unknown): number | null {
  if (typeof raw !== "string" || !/^[0-6]$/.test(raw)) return null;
  const n = Number(raw);
  return isValidWeekday(n) ? n : null;
}

/**
 * ממיר את כל ערכי days_of_week מטופס. אם ערך אחד לא תקין — כל הקלט נדחה
 * (לא "מנקים בשקט" ערכים שגויים). מחזיר מערך ממוין וללא כפילויות.
 */
export function parseWeekdays(
  raws: unknown[]
): { ok: true; days: number[] } | { ok: false } {
  const days: number[] = [];
  for (const raw of raws) {
    const day = parseWeekdayField(raw);
    if (day === null) return { ok: false };
    days.push(day);
  }
  return { ok: true, days: [...new Set(days)].sort((a, b) => a - b) };
}

/** תאריך בפורמט YYYY-MM-DD שהוא גם תאריך קלנדרי אמיתי. */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
