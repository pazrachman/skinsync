import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { addScheduleItem, toggleCompletion } from "@/lib/actions/schedule";
import {
  actAs,
  adminClient,
  createProduct,
  createTestUser,
  deleteTestUsers,
  formData,
  type TestUser,
} from "./helpers";

const DATE = "2026-11-09";

describe("schedule → completion round trip (real local Supabase)", () => {
  let user: TestUser;

  beforeAll(async () => {
    user = await createTestUser("roundtrip");
  });
  afterAll(async () => {
    await deleteTestUsers(user);
  });

  it("creates a schedule item, marks it complete, and reads the saved completion back", async () => {
    actAs(user);
    const productId = await createProduct(user, "Vitamin C serum");

    // 1. יצירת שגרה דרך ה-Server Action
    const created = await addScheduleItem(
      { error: null },
      formData([
        ["product_id", productId],
        ["time_of_day", "morning"],
        ["days_of_week", "1"],
        ["days_of_week", "3"],
      ])
    );
    expect(created).toEqual({ error: null });

    const { data: items, error: itemsError } = await user.client
      .from("schedule_items")
      .select("id, days_of_week, time_of_day, product_id")
      .eq("product_id", productId);
    expect(itemsError).toBeNull();
    expect(items).toHaveLength(1);
    expect(items![0]).toMatchObject({ days_of_week: [1, 3], time_of_day: "morning" });
    const itemId = items![0].id as string;

    // 2. סימון V
    expect(await toggleCompletion(itemId, DATE, false)).toEqual({ error: null });

    // 3. קריאה חוזרת — גם כמשתמשת (דרך RLS) וגם כ-admin (מה באמת בטבלה)
    const { data: mine } = await user.client
      .from("schedule_completions")
      .select("user_id, schedule_item_id, completed_on")
      .eq("schedule_item_id", itemId);
    expect(mine).toEqual([{ user_id: user.id, schedule_item_id: itemId, completed_on: DATE }]);

    const { data: raw } = await adminClient()
      .from("schedule_completions")
      .select("user_id")
      .eq("schedule_item_id", itemId);
    expect(raw).toEqual([{ user_id: user.id }]);

    // סימון כפול (לחיצה כפולה) לא נכשל ולא יוצר כפילות
    expect(await toggleCompletion(itemId, DATE, false)).toEqual({ error: null });
    const { count } = await adminClient()
      .from("schedule_completions")
      .select("*", { count: "exact", head: true })
      .eq("schedule_item_id", itemId);
    expect(count).toBe(1);

    // 4. ביטול סימון
    expect(await toggleCompletion(itemId, DATE, true)).toEqual({ error: null });
    const { data: afterUndo } = await adminClient()
      .from("schedule_completions")
      .select("id")
      .eq("schedule_item_id", itemId);
    expect(afterUndo).toEqual([]);
  });

  it("returns an error (not silent success) when the database rejects the write", async () => {
    actAs(user);
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    // מזהה שאינו uuid → Postgres זורק 22P02 בשאילתת הבעלות
    const result = await toggleCompletion("not-a-uuid", DATE, false);
    expect(result.error).toBeTruthy();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
