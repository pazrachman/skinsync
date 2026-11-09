"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  dbFailure,
  ERR_NOT_FOUND,
  ERR_SIGNED_OUT,
  OK,
  type ActionResult,
} from "@/lib/errors";
import type { TimeOfDay } from "@/lib/types";
import { isIsoDate, parseWeekdays } from "@/lib/validation";

export type ScheduleFormState = ActionResult;

function revalidateSchedule() {
  revalidatePath("/schedule");
  revalidatePath("/dashboard");
}

export async function addScheduleItem(
  _prevState: ScheduleFormState,
  formData: FormData
): Promise<ScheduleFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: ERR_SIGNED_OUT };

  const productId = String(formData.get("product_id") ?? "");
  const timesOfDay = formData
    .getAll("time_of_day")
    .map((t) => String(t))
    .filter((t): t is TimeOfDay => t === "morning" || t === "evening");
  const rawDays = formData.getAll("days_of_week");

  if (!productId) return { error: "יש לבחור מוצר או מכשיר." };
  if (timesOfDay.length === 0) return { error: "יש לבחור בוקר, ערב, או שניהם." };
  if (rawDays.length === 0) return { error: "יש לבחור לפחות יום אחד בשבוע." };

  const parsed = parseWeekdays(rawDays);
  if (!parsed.ok) return { error: "ימים בשבוע חייבים להיות בין ראשון (0) לשבת (6)." };

  // המוצר חייב להיות של המשתמשת המחוברת (RLS אוכף את זה גם בבסיס הנתונים)
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (productError) return dbFailure("addScheduleItem: product lookup", productError);
  if (!product) return { error: ERR_NOT_FOUND };

  // שורה נפרדת לכל סלוט שנבחר (אותו מוצר, אותם ימים)
  const { error } = await supabase.from("schedule_items").insert(
    timesOfDay.map((timeOfDay) => ({
      user_id: user.id,
      product_id: productId,
      time_of_day: timeOfDay,
      days_of_week: parsed.days,
    }))
  );

  if (error) return dbFailure("addScheduleItem: insert", error);

  revalidateSchedule();
  return OK;
}

export async function deleteScheduleItem(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: ERR_SIGNED_OUT };

  const { data, error } = await supabase
    .from("schedule_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error) return dbFailure("deleteScheduleItem", error);
  if (!data || data.length === 0) return { error: ERR_NOT_FOUND };

  revalidateSchedule();
  return OK;
}

/**
 * מסמן/מבטל סימון V לפריט שגרה בתאריך מסוים.
 * isDone = המצב הנוכחי (true → מבטלים סימון, false → מסמנים).
 */
export async function toggleCompletion(
  scheduleItemId: string,
  date: string,
  isDone: boolean
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: ERR_SIGNED_OUT };

  if (!isIsoDate(date)) return { error: "תאריך לא תקין." };

  // בעלות: פריט השגרה חייב להיות של המשתמשת המחוברת. בלי הבדיקה הזו (ובלי
  // מדיניות ה-RLS המתאימה) אפשר היה "לתפוס" את סימון היום של משתמשת אחרת.
  const { data: item, error: lookupError } = await supabase
    .from("schedule_items")
    .select("id")
    .eq("id", scheduleItemId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (lookupError) return dbFailure("toggleCompletion: schedule lookup", lookupError);
  if (!item) return { error: ERR_NOT_FOUND };

  if (isDone) {
    const { error } = await supabase
      .from("schedule_completions")
      .delete()
      .eq("schedule_item_id", scheduleItemId)
      .eq("completed_on", date)
      .eq("user_id", user.id);
    if (error) return dbFailure("toggleCompletion: delete", error);
  } else {
    const { error } = await supabase.from("schedule_completions").insert({
      user_id: user.id,
      schedule_item_id: scheduleItemId,
      completed_on: date,
    });
    // 23505 = כבר מסומן (למשל לחיצה כפולה) — התוצאה הרצויה כבר קיימת.
    if (error && error.code !== "23505") return dbFailure("toggleCompletion: insert", error);
  }

  revalidateSchedule();
  return OK;
}
