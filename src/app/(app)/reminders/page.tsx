import ErrorState from "@/components/ErrorState";
import ReminderManager from "@/components/ReminderManager";
import { logDbError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { MaintenanceReminder } from "@/lib/types";

export default async function RemindersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reminders, error } = await supabase
    .from("maintenance_reminders")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  if (error) {
    logDbError("ReminderManager: load", error);
    return <ErrorState title="לא הצלחנו לטעון את התזכורות" />;
  }

  return <ReminderManager reminders={(reminders ?? []) as MaintenanceReminder[]} />;
}
