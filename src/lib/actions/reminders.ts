"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ReminderFormState {
  error: string | null;
}

export async function upsertReminder(
  _prevState: ReminderFormState,
  formData: FormData
): Promise<ReminderFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "יש להתחבר מחדש." };

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

  const { error } = id
    ? await supabase.from("maintenance_reminders").update(payload).eq("id", id).eq("user_id", user.id)
    : await supabase.from("maintenance_reminders").insert(payload);

  if (error) return { error: error.message };

  revalidatePath("/reminders");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function markReminderDone(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const today = new Date().toISOString().slice(0, 10);
  await supabase
    .from("maintenance_reminders")
    .update({ last_done_on: today })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/reminders");
  revalidatePath("/dashboard");
}

export async function deleteReminder(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("maintenance_reminders").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/reminders");
  revalidatePath("/dashboard");
}
