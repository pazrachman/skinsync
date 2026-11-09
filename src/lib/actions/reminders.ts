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

export type ReminderFormState = ActionResult;

export async function upsertReminder(
  _prevState: ReminderFormState,
  formData: FormData
): Promise<ReminderFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: ERR_SIGNED_OUT };

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const cadenceDays = Number(formData.get("cadence_days") ?? 7);

  if (!title) return { error: "יש להזין שם משימה." };
  if (!Number.isFinite(cadenceDays) || cadenceDays <= 0) {
    return { error: "תדירות חייבת להיות מספר ימים חיובי." };
  }

  const payload = {
    user_id: user.id,
    title,
    notes: notes || null,
    cadence_days: cadenceDays,
  };

  const { data, error } = id
    ? await supabase
        .from("maintenance_reminders")
        .update(payload)
        .eq("id", id)
        .eq("user_id", user.id)
        .select("id")
    : await supabase.from("maintenance_reminders").insert(payload).select("id");

  if (error) return dbFailure("upsertReminder", error);
  if (!data || data.length === 0) return { error: ERR_NOT_FOUND };

  revalidatePath("/reminders");
  revalidatePath("/dashboard");
  return OK;
}

export async function markReminderDone(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: ERR_SIGNED_OUT };

  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("maintenance_reminders")
    .update({ last_done_on: today })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error) return dbFailure("markReminderDone", error);
  if (!data || data.length === 0) return { error: ERR_NOT_FOUND };

  revalidatePath("/reminders");
  revalidatePath("/dashboard");
  return OK;
}

export async function deleteReminder(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: ERR_SIGNED_OUT };

  const { data, error } = await supabase
    .from("maintenance_reminders")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error) return dbFailure("deleteReminder", error);
  if (!data || data.length === 0) return { error: ERR_NOT_FOUND };

  revalidatePath("/reminders");
  revalidatePath("/dashboard");
  return OK;
}
