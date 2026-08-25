import ReminderManager from "@/components/ReminderManager";
import { createClient } from "@/lib/supabase/server";
import type { MaintenanceReminder } from "@/lib/types";

export default async function RemindersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reminders } = await supabase
    .from("maintenance_reminders")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return <ReminderManager reminders={(reminders as MaintenanceReminder[]) ?? []} />;
}
