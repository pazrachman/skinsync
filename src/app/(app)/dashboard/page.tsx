import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import ExpiringTiles from "@/components/ExpiringTiles";
import ReminderList from "@/components/ReminderList";
import TodayRoutine from "@/components/TodayRoutine";
import { getExpiryInfo, getReminderDueInfo } from "@/lib/expiry";
import { logDbError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { MaintenanceReminder, Product, ScheduleCompletion, ScheduleItem } from "@/lib/types";

// ברכה לפי השעה בישראל (השרת עצמו רץ ב-UTC).
function greeting(now: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Jerusalem" }).format(now)
  );
  if (hour >= 5 && hour < 12) return "בוקר טוב";
  if (hour >= 12 && hour < 17) return "צהריים טובים";
  return "ערב טוב";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const todayDow = today.getDay();

  const [productsRes, scheduleRes, completionsRes, remindersRes] = await Promise.all([
    supabase.from("products").select("*").eq("user_id", user!.id),
    supabase.from("schedule_items").select("*, product:products(*)").eq("user_id", user!.id),
    supabase
      .from("schedule_completions")
      .select("*")
      .eq("user_id", user!.id)
      .eq("completed_on", todayIso),
    supabase.from("maintenance_reminders").select("*").eq("user_id", user!.id),
  ]);

  // קריאה שנכשלה היא לא "אין נתונים" — מציגים שגיאה ברורה במקום מצב ריק.
  const failed = [productsRes, scheduleRes, completionsRes, remindersRes].find((r) => r.error);
  if (failed?.error) {
    logDbError("DashboardPage: load", failed.error);
    return <ErrorState title="לא הצלחנו לטעון את לוח הבקרה" />;
  }

  const productsTyped = (productsRes.data ?? []) as Product[];
  const scheduleTyped = (scheduleRes.data ?? []) as unknown as ScheduleItem[];
  const completionsTyped = (completionsRes.data ?? []) as ScheduleCompletion[];
  const remindersTyped = (remindersRes.data ?? []) as MaintenanceReminder[];

  const todayItems = scheduleTyped.filter((it) => it.days_of_week.includes(todayDow));
  const completedIds = new Set(completionsTyped.map((c) => c.schedule_item_id));
  const completedTodayCount = todayItems.filter((it) => completedIds.has(it.id)).length;

  const attention = productsTyped
    .map((p) => ({ product: p, info: getExpiryInfo(p) }))
    .filter((x) => x.info.status === "expired" || x.info.status === "soon")
    .sort((a, b) => (a.info.daysLeft ?? 0) - (b.info.daysLeft ?? 0));

  const dueReminders = remindersTyped
    .map((r) => ({ reminder: r, info: getReminderDueInfo(r) }))
    .filter(
      (x) => x.info.status === "overdue" || x.info.status === "due_soon" || x.info.status === "never_done"
    )
    .sort((a, b) => (a.info.daysLeft ?? -9999) - (b.info.daysLeft ?? -9999));

  const name = (user?.user_metadata?.display_name as string | undefined)?.trim();

  return (
    <div>
      <section className="skn-hero">
        <div>
          <p className="skn-eyebrow">
            {today.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="skn-title">
            {greeting(today)}
            {name ? `, ${name}` : ""}
          </h1>
        </div>

        {todayItems.length > 0 && (
          <div className="skn-hero-progress">
            <div className="skn-progress-head">
              <span className="font-medium">השגרה של היום</span>
              <span className="skn-num text-skn-muted">
                {completedTodayCount} מתוך {todayItems.length}
              </span>
            </div>
            <div
              className="skn-progress"
              role="progressbar"
              aria-label="השגרה של היום"
              aria-valuemin={0}
              aria-valuemax={todayItems.length}
              aria-valuenow={completedTodayCount}
            >
              <span style={{ width: `${Math.round((completedTodayCount / todayItems.length) * 100)}%` }} />
            </div>
          </div>
        )}
      </section>

      <div className="skn-stack">
        <section className="skn-section" aria-label="השגרה של היום">
          <TodayRoutine items={todayItems} completedIds={completedIds} date={todayIso} />
        </section>

        <section className="skn-section">
          <div className="skn-section-head">
            <h2 className="skn-section-title">עומדים לפוג</h2>
            <Link href="/inventory" className="skn-link">
              לארון
            </Link>
          </div>
          {attention.length === 0 ? (
            <EmptyState icon={Sparkles}>אין מוצרים שפג תוקפם או מתקרבים לתפוגה</EmptyState>
          ) : (
            <ExpiringTiles products={attention.map((a) => a.product)} />
          )}
        </section>

        <section className="skn-section">
          <div className="skn-section-head">
            <h2 className="skn-section-title">תזכורות</h2>
            <Link href="/reminders" className="skn-link">
              לכל התזכורות
            </Link>
          </div>
          {dueReminders.length === 0 ? (
            <EmptyState icon={CheckCircle2}>הכל מסודר, אין תזכורות שממתינות כרגע.</EmptyState>
          ) : (
            <ReminderList reminders={dueReminders.map((d) => d.reminder)} />
          )}
        </section>
      </div>
    </div>
  );
}
