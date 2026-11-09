import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { revalidatePath } from "next/cache";
import { deleteProduct, markProductOpened, upsertProduct } from "@/lib/actions/products";
import { deleteReminder, markReminderDone } from "@/lib/actions/reminders";
import { addScheduleItem, deleteScheduleItem, toggleCompletion } from "@/lib/actions/schedule";
import { ERR_NOT_FOUND, ERR_SAVE_FAILED, ERR_SIGNED_OUT } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { fakeSupabase, type FakeResult } from "../helpers/fakeSupabase";

// מסלולי כישלון שקשה לייצר מול DB אמיתי (שגיאת רשת/שרת). ה-DB "נכשל" כאן
// באמצעות קליינט מזויף, ובודקים שה-action מחזיר שגיאה ולא מדווח הצלחה.

const DB_DOWN = { message: "connection terminated", code: "08006" };
const ITEM = "11111111-1111-1111-1111-111111111111";

function useFake(opts: Parameters<typeof fakeSupabase>[0]) {
  const fake = fakeSupabase(opts);
  vi.mocked(createClient).mockResolvedValue(fake.client as never);
  return fake;
}

beforeEach(() => {
  vi.mocked(revalidatePath).mockClear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("toggleCompletion", () => {
  const ownedItem: FakeResult = { data: { id: ITEM } };

  it("returns an error when the completion insert fails", async () => {
    useFake({
      results: {
        "schedule_items.select": ownedItem,
        "schedule_completions.insert": { error: DB_DOWN },
      },
    });
    expect(await toggleCompletion(ITEM, "2026-11-09", false)).toEqual({ error: ERR_SAVE_FAILED });
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("returns an error when the completion delete fails", async () => {
    useFake({
      results: {
        "schedule_items.select": ownedItem,
        "schedule_completions.delete": { error: DB_DOWN },
      },
    });
    expect(await toggleCompletion(ITEM, "2026-11-09", true)).toEqual({ error: ERR_SAVE_FAILED });
  });

  it("returns an error when the ownership lookup fails (and never writes)", async () => {
    const fake = useFake({ results: { "schedule_items.select": { error: DB_DOWN } } });
    expect(await toggleCompletion(ITEM, "2026-11-09", false)).toEqual({ error: ERR_SAVE_FAILED });
    expect(fake.calls.some((c) => c.table === "schedule_completions")).toBe(false);
  });

  it("returns not-found for a schedule item the user doesn't own (and never writes)", async () => {
    const fake = useFake({ results: { "schedule_items.select": { data: null } } });
    expect(await toggleCompletion(ITEM, "2026-11-09", false)).toEqual({ error: ERR_NOT_FOUND });
    expect(fake.calls.some((c) => c.table === "schedule_completions")).toBe(false);
  });

  it("treats a duplicate (already completed) as success", async () => {
    useFake({
      results: {
        "schedule_items.select": ownedItem,
        "schedule_completions.insert": { error: { message: "duplicate", code: "23505" } },
      },
    });
    expect(await toggleCompletion(ITEM, "2026-11-09", false)).toEqual({ error: null });
  });

  it("rejects an invalid date before touching the DB", async () => {
    const fake = useFake({});
    expect((await toggleCompletion(ITEM, "2026-02-30", false)).error).toBeTruthy();
    expect(fake.calls).toHaveLength(0);
  });

  it("returns signed-out error with no user", async () => {
    useFake({ user: null });
    expect(await toggleCompletion(ITEM, "2026-11-09", false)).toEqual({ error: ERR_SIGNED_OUT });
  });
});

describe("other actions no longer swallow errors", () => {
  it("addScheduleItem: insert failure", async () => {
    useFake({
      results: {
        "products.select": { data: { id: "p1" } },
        "schedule_items.insert": { error: DB_DOWN },
      },
    });
    const fd = new FormData();
    fd.append("product_id", "p1");
    fd.append("time_of_day", "morning");
    fd.append("days_of_week", "1");
    expect(await addScheduleItem({ error: null }, fd)).toEqual({ error: ERR_SAVE_FAILED });
  });

  it.each([
    ["deleteScheduleItem", () => deleteScheduleItem("x"), "schedule_items.delete"],
    ["deleteProduct", () => deleteProduct("x"), "products.delete"],
    ["markProductOpened", () => markProductOpened("x"), "products.update"],
    ["markReminderDone", () => markReminderDone("x"), "maintenance_reminders.update"],
    ["deleteReminder", () => deleteReminder("x"), "maintenance_reminders.delete"],
  ] as const)("%s: DB failure → error result", async (_name, run, key) => {
    useFake({ results: { [key]: { error: DB_DOWN } } });
    expect(await run()).toEqual({ error: ERR_SAVE_FAILED });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each([
    ["deleteScheduleItem", () => deleteScheduleItem("x"), "schedule_items.delete"],
    ["deleteProduct", () => deleteProduct("x"), "products.delete"],
    ["markReminderDone", () => markReminderDone("x"), "maintenance_reminders.update"],
  ] as const)("%s: zero rows affected → not-found (not silent success)", async (_name, run, key) => {
    useFake({ results: { [key]: { data: [] } } });
    expect(await run()).toEqual({ error: ERR_NOT_FOUND });
  });

  it("upsertProduct: DB failure returns a friendly message, not the raw Postgres error", async () => {
    useFake({ results: { "products.insert": { error: DB_DOWN } } });
    const fd = new FormData();
    fd.append("name", "Serum");
    const result = await upsertProduct({ error: null }, fd);
    expect(result).toEqual({ error: ERR_SAVE_FAILED });
    expect(result.error).not.toContain("connection terminated");
  });
});
