import Link from "next/link";
import TodayRoutine from "@/components/TodayRoutine";
import { EXPIRY_STATUS_COLOR, EXPIRY_STATUS_LABEL, getExpiryInfo, getReminderDueInfo } from "@/lib/expiry";
import { createClient } from "@/lib/supabase/server";
import type { MaintenanceReminder, Product, ScheduleCompletion, ScheduleItem } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const todayDow = today.getDay();

  const [{ data: products }, { data: scheduleItems }, { data: completions }, { data: reminders }] =
    await Promise.all([
      supabase.from("products").select("*").eq("user_id", user!.id),
      supabase
        .from("schedule_items")
        .select("*, product:products(*)")
        .eq("user_id", user!.id),
      supabase
        .from("schedule_completions")
        .select("*")
        .eq("user_id", user!.id)
        .eq("completed_on", todayIso),
      supabase.from("maintenance_reminders").select("*").eq("user_id", user!.id),
    ]);

  const productsTyped = (products as Product[]) ?? [];
  const scheduleTyped = (scheduleItems as unknown as ScheduleItem[]) ?? [];
  const completionsTyped = (completions as ScheduleCompletion[]) ?? [];
  const remindersTyped = (reminders as MaintenanceReminder[]) ?? [];

  const todayItems = scheduleTyped.filter((it) => it.days_of_week.includes(todayDow));
  const completedIds = new Set(completionsTyped.map((c) => c.schedule_item_id));

  const attention = productsTyped
    .map((p) => ({ product: p, info: getExpiryInfo(p) }))
    .filter((x) => x.info.status === "expired" || x.info.status === "soon")
    .sort((a, b) => (a.info.daysLeft ?? 0) - (b.info.daysLeft ?? 0));

  const dueReminders = remindersTyped
    .map((r) => ({ reminder: r, info: getReminderDueInfo(r) }))
    .filter((x) => x.info.status === "overdue" || x.info.status === "due_soon" || x.info.status === "never_done")
    .sort((a, b) => (a.info.daysLeft ?? -9999) - (b.info.daysLeft ?? -9999));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-medium text-skn-ink">
          {today.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}
        </h1>
        <p className="text-sm text-skn-ink/55">ריכוז מהיר של מה שקורה היום בשגרת הטיפוח שלך</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-skn-ink/85">השגרה של היום</h2>
        <TodayRoutine items={todayItems} completedIds={completedIds} date={todayIso} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-skn-ink/85">מוצרים שדורשים תשומת לב</h2>
          <Link href="/inventory" className="text-sm font-medium text-skn-pink-deep hover:underline">
            לכל הארון
          </Link>
        </div>
        {attention.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-skn-sand bg-white p-6 text-center text-sm text-skn-ink/55">
            אין מוצרים שפג תוקפם או מתקרבים לתפוגה 🎉
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {attention.map(({ product, info }) => (
              <li
                key={product.id}
                className="flex items-center justify-between rounded-2xl border border-skn-sand bg-white p-3 shadow-sm"
              >
                <span className="font-medium text-skn-ink/85">
                  {product.name}
                  {product.brand && <span className="text-skn-ink/40"> · {product.brand}</span>}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${EXPIRY_STATUS_COLOR[info.status]}`}
                >
                  {EXPIRY_STATUS_LABEL[info.status]}
                  {info.daysLeft !== null &&
                    (info.status === "expired"
                      ? ` · לפני ${Math.abs(info.daysLeft)} ימים`
                      : ` · בעוד ${info.daysLeft} ימים`)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-skn-ink/85">תזכורות תחזוקה</h2>
          <Link href="/reminders" className="text-sm font-medium text-skn-pink-deep hover:underline">
            לכל התזכורות
          </Link>
        </div>
        {dueReminders.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-skn-sand bg-white p-6 text-center text-sm text-skn-ink/55">
            הכל מסודר, אין תזכורות שממתינות כרגע.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {dueReminders.map(({ reminder, info }) => (
              <li
                key={reminder.id}
                className="flex items-center justify-between rounded-2xl border border-skn-sand bg-white p-3 shadow-sm"
              >
                <span className="font-medium text-skn-ink/85">{reminder.title}</span>
                <span className="text-xs text-skn-ink/55">
                  {info.status === "never_done"
                    ? "טרם בוצע"
                    : info.status === "overdue"
                    ? `באיחור של ${Math.abs(info.daysLeft ?? 0)} ימים`
                    : `בעוד ${info.daysLeft} ימים`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
