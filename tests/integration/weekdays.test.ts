import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { addScheduleItem } from "@/lib/actions/schedule";
import {
  actAs,
  adminClient,
  createProduct,
  createTestUser,
  deleteTestUsers,
  formData,
  type TestUser,
} from "./helpers";

async function scheduleCount(productId: string) {
  const { count, error } = await adminClient()
    .from("schedule_items")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);
  if (error) throw error;
  return count;
}

describe("weekday validation", () => {
  let user: TestUser;
  let productId: string;

  beforeAll(async () => {
    user = await createTestUser("weekdays");
    productId = await createProduct(user);
  });
  afterAll(async () => {
    await deleteTestUsers(user);
  });

  describe("addScheduleItem action", () => {
    // ערכי FormData תמיד מגיעים כמחרוזות — כך נראה כל קלט זדוני/שבור מהטופס
    it.each(["-1", "7", "8", "2.5", "NaN", "", " 3", "3.0", "03", "abc", "Infinity"])(
      "rejects days_of_week=%j and saves nothing",
      async (bad) => {
        actAs(user);
        const result = await addScheduleItem(
          { error: null },
          formData([
            ["product_id", productId],
            ["time_of_day", "morning"],
            ["days_of_week", "1"], // ערך תקין לצד ערך שגוי — כל הבקשה נדחית
            ["days_of_week", bad],
          ])
        );
        expect(result.error).toMatch(/ימים בשבוע/);
        expect(await scheduleCount(productId)).toBe(0);
      }
    );

    it("accepts every valid day 0..6 (dedupes + sorts)", async () => {
      actAs(user);
      const result = await addScheduleItem(
        { error: null },
        formData([
          ["product_id", productId],
          ["time_of_day", "evening"],
          ...["6", "0", "3", "3", "1", "2", "4", "5"].map((d): [string, string] => ["days_of_week", d]),
        ])
      );
      expect(result).toEqual({ error: null });
      const { data } = await adminClient()
        .from("schedule_items")
        .select("days_of_week")
        .eq("product_id", productId);
      expect(data).toEqual([{ days_of_week: [0, 1, 2, 3, 4, 5, 6] }]);
      await adminClient().from("schedule_items").delete().eq("product_id", productId);
    });
  });

  describe("database CHECK constraint (service role — bypasses RLS and the action)", () => {
    async function insertDays(days: unknown[]) {
      return adminClient()
        .from("schedule_items")
        .insert({ user_id: user.id, product_id: productId, time_of_day: "morning", days_of_week: days })
        .select("days_of_week");
    }

    it.each([[[-1]], [[7]], [[8]], [[1, 8]]])("rejects %j with a check violation", async (days) => {
      const { error } = await insertDays(days);
      expect(error?.code).toBe("23514"); // check_violation
      expect(error?.message).toMatch(/schedule_items_days_of_week_range/);
      expect(await scheduleCount(productId)).toBe(0);
    });

    it("rejects NaN (JSON-encoded as null) with a check violation", async () => {
      const { error } = await insertDays([NaN]);
      expect(error?.code).toBe("23514");
      expect(await scheduleCount(productId)).toBe(0);
    });

    it("rejects 2.5 — not an integer for the smallint[] column", async () => {
      const { error } = await insertDays([2.5]);
      expect(error?.code).toBe("22P02"); // invalid_text_representation
      expect(await scheduleCount(productId)).toBe(0);
    });

    it.each([[["8"]], [["abc"]], [["2.5"]]])("rejects string weekday %j", async (days) => {
      const { error } = await insertDays(days);
      expect(error).not.toBeNull();
      expect(["23514", "22P02"]).toContain(error?.code);
      expect(await scheduleCount(productId)).toBe(0);
    });

    it('stores "3" as the integer 3 (Postgres casts JSON text to smallint) — never as a string', async () => {
      const { data, error } = await insertDays(["3"]);
      expect(error).toBeNull();
      expect(data).toEqual([{ days_of_week: [3] }]);
      await adminClient().from("schedule_items").delete().eq("product_id", productId);
    });

    it("accepts the full valid range", async () => {
      const { error } = await insertDays([0, 1, 2, 3, 4, 5, 6]);
      expect(error).toBeNull();
      await adminClient().from("schedule_items").delete().eq("product_id", productId);
    });
  });
});
