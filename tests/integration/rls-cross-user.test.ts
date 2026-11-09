import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { addScheduleItem, deleteScheduleItem, toggleCompletion } from "@/lib/actions/schedule";
import { ERR_NOT_FOUND } from "@/lib/errors";
import {
  actAs,
  adminClient,
  createProduct,
  createScheduleItem,
  createTestUser,
  deleteTestUsers,
  formData,
  type TestUser,
} from "./helpers";

// הבדיקות כאן לא מסתפקות ב"RLS מופעל": הן מנסות בפועל לתקוף משתמשת אחרת
// ומוודאות (עם service role, שעוקף RLS) שלא נכתב כלום לטבלה.

const DATE = "2026-11-10";

async function completionRows(scheduleItemId: string) {
  const { data, error } = await adminClient()
    .from("schedule_completions")
    .select("user_id, completed_on")
    .eq("schedule_item_id", scheduleItemId);
  if (error) throw error;
  return data;
}

describe("cross-user access is blocked", () => {
  let alice: TestUser;
  let mallory: TestUser;
  let aliceProductId: string;
  let aliceItemId: string;
  let malloryItemId: string;

  beforeAll(async () => {
    [alice, mallory] = await Promise.all([createTestUser("alice"), createTestUser("mallory")]);
    aliceProductId = await createProduct(alice, "Alice retinol");
    aliceItemId = await createScheduleItem(alice, aliceProductId);
    malloryItemId = await createScheduleItem(mallory, await createProduct(mallory, "Mallory cream"));
  });
  afterAll(async () => {
    await deleteTestUsers(alice, mallory);
  });
  beforeEach(async () => {
    await adminClient().from("schedule_completions").delete().in("schedule_item_id", [aliceItemId, malloryItemId]);
  });

  describe("RLS (direct table access with Mallory's own session)", () => {
    it("positive control: Mallory CAN insert a completion for her own schedule", async () => {
      const { error } = await mallory.client
        .from("schedule_completions")
        .insert({ user_id: mallory.id, schedule_item_id: malloryItemId, completed_on: DATE });
      expect(error).toBeNull();
      expect(await completionRows(malloryItemId)).toEqual([{ user_id: mallory.id, completed_on: DATE }]);
    });

    it("rejects INSERT of a completion (with her own user_id) for Alice's schedule", async () => {
      const { error } = await mallory.client
        .from("schedule_completions")
        .insert({ user_id: mallory.id, schedule_item_id: aliceItemId, completed_on: DATE });

      expect(error?.code).toBe("42501"); // new row violates row-level security policy
      expect(await completionRows(aliceItemId)).toEqual([]);
    });

    it("rejects INSERT impersonating Alice's user_id", async () => {
      const { error } = await mallory.client
        .from("schedule_completions")
        .insert({ user_id: alice.id, schedule_item_id: aliceItemId, completed_on: DATE });

      expect(error?.code).toBe("42501");
      expect(await completionRows(aliceItemId)).toEqual([]);
    });

    it("rejects UPDATE that re-points her own completion at Alice's schedule", async () => {
      const { data: own, error: insertError } = await mallory.client
        .from("schedule_completions")
        .insert({ user_id: mallory.id, schedule_item_id: malloryItemId, completed_on: DATE })
        .select("id")
        .single();
      expect(insertError).toBeNull();

      const { error } = await mallory.client
        .from("schedule_completions")
        .update({ schedule_item_id: aliceItemId })
        .eq("id", own!.id);

      expect(error?.code).toBe("42501");
      expect(await completionRows(aliceItemId)).toEqual([]);
      expect(await completionRows(malloryItemId)).toHaveLength(1);
    });

    it("Alice can still mark the day complete afterwards (no blocking row was created)", async () => {
      await mallory.client
        .from("schedule_completions")
        .insert({ user_id: mallory.id, schedule_item_id: aliceItemId, completed_on: DATE });

      const { error } = await alice.client
        .from("schedule_completions")
        .insert({ user_id: alice.id, schedule_item_id: aliceItemId, completed_on: DATE });
      expect(error).toBeNull();
      expect(await completionRows(aliceItemId)).toEqual([{ user_id: alice.id, completed_on: DATE }]);
    });

    it("Mallory cannot read or delete Alice's completions", async () => {
      await adminClient()
        .from("schedule_completions")
        .insert({ user_id: alice.id, schedule_item_id: aliceItemId, completed_on: DATE });

      const { data: visible } = await mallory.client
        .from("schedule_completions")
        .select("id")
        .eq("schedule_item_id", aliceItemId);
      expect(visible).toEqual([]);

      await mallory.client.from("schedule_completions").delete().eq("schedule_item_id", aliceItemId);
      expect(await completionRows(aliceItemId)).toHaveLength(1);
    });

    it("rejects a schedule item that references Alice's product", async () => {
      const { error } = await mallory.client
        .from("schedule_items")
        .insert({ user_id: mallory.id, product_id: aliceProductId, days_of_week: [1], time_of_day: "evening" });
      expect(error?.code).toBe("42501");

      const { data } = await adminClient()
        .from("schedule_items")
        .select("id")
        .eq("product_id", aliceProductId)
        .eq("user_id", mallory.id);
      expect(data).toEqual([]);
    });
  });

  describe("server actions (signed in as Mallory)", () => {
    beforeEach(() => actAs(mallory));

    it("toggleCompletion refuses Alice's schedule item and writes nothing", async () => {
      const result = await toggleCompletion(aliceItemId, DATE, false);
      expect(result).toEqual({ error: ERR_NOT_FOUND });
      expect(await completionRows(aliceItemId)).toEqual([]);
    });

    it("toggleCompletion (undo) cannot remove Alice's completion", async () => {
      await adminClient()
        .from("schedule_completions")
        .insert({ user_id: alice.id, schedule_item_id: aliceItemId, completed_on: DATE });

      const result = await toggleCompletion(aliceItemId, DATE, true);
      expect(result).toEqual({ error: ERR_NOT_FOUND });
      expect(await completionRows(aliceItemId)).toHaveLength(1);
    });

    it("addScheduleItem refuses Alice's product", async () => {
      const result = await addScheduleItem(
        { error: null },
        formData([
          ["product_id", aliceProductId],
          ["time_of_day", "morning"],
          ["days_of_week", "2"],
        ])
      );
      expect(result).toEqual({ error: ERR_NOT_FOUND });
    });

    it("deleteScheduleItem cannot delete Alice's schedule item", async () => {
      const result = await deleteScheduleItem(aliceItemId);
      expect(result).toEqual({ error: ERR_NOT_FOUND });

      const { data } = await adminClient().from("schedule_items").select("id").eq("id", aliceItemId);
      expect(data).toHaveLength(1);
    });
  });
});
