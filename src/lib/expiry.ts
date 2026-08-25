import { addMonths, differenceInCalendarDays, parseISO } from "date-fns";
import type { ExpiryStatus, Product } from "./types";

/** ימי הסף לצביעה צהובה (מתקרב לתפוגה) */
const SOON_THRESHOLD_DAYS = 30;

export interface ExpiryInfo {
  status: ExpiryStatus;
  expiryDate: Date | null;
  daysLeft: number | null;
}

/**
 * מחשב את תאריך התפוגה והסטטוס (ירוק/צהוב/אדום) של מוצר.
 * - אם יש expiry_date_override, הוא גובר על החישוב.
 * - אחרת, אם יש open_date, מחשבים open_date + shelf_life_months.
 * - אם המוצר טרם נפתח (אין open_date), הסטטוס הוא "unopened".
 */
export function getExpiryInfo(product: Pick<Product, "open_date" | "shelf_life_months" | "expiry_date_override">, today: Date = new Date()): ExpiryInfo {
  let expiryDate: Date | null = null;

  if (product.expiry_date_override) {
    expiryDate = parseISO(product.expiry_date_override);
  } else if (product.open_date) {
    expiryDate = addMonths(parseISO(product.open_date), product.shelf_life_months);
  }

  if (!expiryDate) {
    return { status: "unopened", expiryDate: null, daysLeft: null };
  }

  const daysLeft = differenceInCalendarDays(expiryDate, today);

  let status: ExpiryStatus;
  if (daysLeft < 0) status = "expired";
  else if (daysLeft <= SOON_THRESHOLD_DAYS) status = "soon";
  else status = "fresh";

  return { status, expiryDate, daysLeft };
}

export const EXPIRY_STATUS_LABEL: Record<ExpiryStatus, string> = {
  unopened: "טרם נפתח",
  fresh: "בתוקף",
  soon: "מתקרב לתפוגה",
  expired: "פג תוקף",
};

export const EXPIRY_STATUS_COLOR: Record<ExpiryStatus, string> = {
  unopened: "bg-skn-sand/40 text-skn-ink/60 border-skn-sand",
  fresh: "bg-skn-sage/10 text-skn-sage border-skn-sage/30",
  soon: "bg-skn-honey/10 text-skn-honey border-skn-honey/30",
  expired: "bg-skn-berry/10 text-skn-berry border-skn-berry/30",
};

export type ReminderStatus = "ok" | "due_soon" | "overdue" | "never_done";

export interface ReminderDueInfo {
  status: ReminderStatus;
  nextDueDate: Date | null;
  daysLeft: number | null;
}

const REMINDER_DUE_SOON_DAYS = 2;

/** מחשב מתי המשימה הבאה חלה, בהתבסס על תאריך הביצוע האחרון והתדירות. */
export function getReminderDueInfo(
  reminder: { last_done_on: string | null; cadence_days: number },
  today: Date = new Date()
): ReminderDueInfo {
  if (!reminder.last_done_on) {
    return { status: "never_done", nextDueDate: null, daysLeft: null };
  }

  const nextDueDate = addDaysCompat(parseISO(reminder.last_done_on), reminder.cadence_days);
  const daysLeft = differenceInCalendarDays(nextDueDate, today);

  let status: ReminderStatus;
  if (daysLeft < 0) status = "overdue";
  else if (daysLeft <= REMINDER_DUE_SOON_DAYS) status = "due_soon";
  else status = "ok";

  return { status, nextDueDate, daysLeft };
}

function addDaysCompat(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const REMINDER_STATUS_LABEL: Record<ReminderStatus, string> = {
  never_done: "טרם בוצע",
  ok: "בתוקף",
  due_soon: "מתקרב",
  overdue: "באיחור",
};

export const REMINDER_STATUS_COLOR: Record<ReminderStatus, string> = {
  never_done: "bg-skn-sand/40 text-skn-ink/60 border-skn-sand",
  ok: "bg-skn-sage/10 text-skn-sage border-skn-sage/30",
  due_soon: "bg-skn-honey/10 text-skn-honey border-skn-honey/30",
  overdue: "bg-skn-berry/10 text-skn-berry border-skn-berry/30",
};
