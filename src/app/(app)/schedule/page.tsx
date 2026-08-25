import { addDays, format, startOfWeek } from "date-fns";
import ScheduleGrid from "@/components/ScheduleGrid";
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

  const [{ data: products }, { data: scheduleItems }, { data: completions }] =
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

  return (
    <ScheduleGrid
      products={(products as Product[]) ?? []}
      scheduleItems={(scheduleItems as unknown as ScheduleItem[]) ?? []}
      completions={(completions as ScheduleCompletion[]) ?? []}
      weekDates={weekDates}
    />
  );
}
