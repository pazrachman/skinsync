import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { inject, vi } from "vitest";
import { createClient as createServerClient } from "@/lib/supabase/server";

const NO_SESSION = { auth: { persistSession: false, autoRefreshToken: false } };

/** קליינט service-role: עוקף RLS. משמש רק להכנה/ניקוי ולבדיקת "מה באמת נשמר". */
export function adminClient(): SupabaseClient {
  const { url, serviceRoleKey } = inject("supabase");
  return createClient(url, serviceRoleKey, NO_SESSION);
}

export interface TestUser {
  id: string;
  email: string;
  /** קליינט anon עם session של המשתמש — כפוף ל-RLS בדיוק כמו בדפדפן. */
  client: SupabaseClient;
}

export async function createTestUser(label: string): Promise<TestUser> {
  const { url, anonKey } = inject("supabase");
  const email = `${label}-${randomUUID()}@skinsync.test`;
  const password = `pw-${randomUUID()}`;

  const { data, error } = await adminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error("createUser failed");

  const client = createClient(url, anonKey, NO_SESSION);
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;

  return { id: data.user.id, email, client };
}

/** מחיקת המשתמש מוחקת ב-cascade את כל הנתונים שלו. */
export async function deleteTestUsers(...users: (TestUser | undefined)[]) {
  const admin = adminClient();
  await Promise.all(
    users.filter((u): u is TestUser => !!u).map((u) => admin.auth.admin.deleteUser(u.id))
  );
}

export async function createProduct(user: TestUser, name = "Test serum") {
  const { data, error } = await user.client
    .from("products")
    .insert({ user_id: user.id, name })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function createScheduleItem(
  user: TestUser,
  productId: string,
  days: number[] = [0, 1, 2, 3, 4, 5, 6]
) {
  const { data, error } = await user.client
    .from("schedule_items")
    .insert({ user_id: user.id, product_id: productId, days_of_week: days, time_of_day: "morning" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

/**
 * גורם ל-Server Actions (שקוראים ל-createClient מ-@/lib/supabase/server)
 * לרוץ כמשתמש הזה, מול ה-DB האמיתי. דורש vi.mock("@/lib/supabase/server")
 * בקובץ הבדיקה.
 */
export function actAs(user: TestUser) {
  vi.mocked(createServerClient).mockResolvedValue(user.client as never);
}

export function formData(entries: [string, string][]) {
  const fd = new FormData();
  for (const [k, v] of entries) fd.append(k, v);
  return fd;
}
