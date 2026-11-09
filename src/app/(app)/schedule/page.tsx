import { addDays, format, startOfWeek } from "date-fns";
import ErrorState from "@/components/ErrorState";
import ScheduleGrid from "@/components/ScheduleGrid";
import { logDbError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { Product, ScheduleCompletion, ScheduleItem } from "@/lib/types";

export default async function SchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(weekStart, i), "yyyy-MM-dd")
  );

  const [productsRes, scheduleRes, completionsRes] =
    await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("user_id", user!.id)
        .order("name"),
      supabase
        .from("schedule_items")
        .select("*, product:products(*)")
        .eq("user_id", user!.id)
        .order("sort_order"),
      supabase
        .from("schedule_completions")
        .select("*")
        .eq("user_id", user!.id)
        .gte("completed_on", weekDates[0])
        .lte("completed_on", weekDates[6]),
    ]);

  const failed = [productsRes, scheduleRes, completionsRes].find((r) => r.error);
  if (failed?.error) {
    logDbError("SchedulePage: load", failed.error);
    return <ErrorState title="לא הצלחנו לטעון את השגרה השבועית" />;
  }

  return (
    <ScheduleGrid
      products={(productsRes.data ?? []) as Product[]}
      scheduleItems={(scheduleRes.data ?? []) as unknown as ScheduleItem[]}
      completions={(completionsRes.data ?? []) as ScheduleCompletion[]}
      weekDates={weekDates}
    />
  );
}
