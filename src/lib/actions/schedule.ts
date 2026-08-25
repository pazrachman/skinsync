"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TimeOfDay } from "@/lib/types";

export interface ScheduleFormState {
  error: string | null;
}

export async function addScheduleItem(
  _prevState: ScheduleFormState,
  formData: FormData
): Promise<ScheduleFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "יש להתחבר מחדש." };

  const productId = String(formData.get("product_id") ?? "");
  const timeOfDay = String(formData.get("time_of_day") ?? "") as TimeOfDay;
  const days = formData.getAll("days_of_week").map((d) => Number(d));

  if (!productId) return { error: "יש לבחור מוצר או מכשיר." };
  if (timeOfDay !== "morning" && timeOfDay !== "evening") {
    return { error: "יש לבחור בוקר או ערב." };
  }
  if (days.length === 0) return { error: "יש לבחור לפחות יום אחד בשבוע." };

  const { error } = await supabase.from("schedule_items").insert({
    user_id: user.id,
    product_id: productId,
    time_of_day: timeOfDay,
    days_of_week: days,
  });

  if (error) return { error: error.message };

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteScheduleItem(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("schedule_items").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
}

export async function toggleCompletion(
  scheduleItemId: string,
  date: string,
  isDone: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (isDone) {
    await supabase
      .from("schedule_completions")
      .delete()
      .eq("schedule_item_id", scheduleItemId)
      .eq("completed_on", date)
      .eq("user_id", user.id);
  } else {
    await supabase.from("schedule_completions").insert({
      user_id: user.id,
      schedule_item_id: scheduleItemId,
      completed_on: date,
    });
  }

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
}
