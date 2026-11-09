// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/actions/schedule", () => ({ toggleCompletion: vi.fn() }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import DashboardPage from "@/app/(app)/dashboard/page";
import { createClient } from "@/lib/supabase/server";
import { fakeSupabase } from "../helpers/fakeSupabase";

const EMPTY_PRODUCTS_TEXT = "אין מוצרים שפג תוקפם או מתקרבים לתפוגה";
const EMPTY_REMINDERS_TEXT = "הכל מסודר, אין תזכורות שממתינות כרגע.";

async function renderDashboard(results: Parameters<typeof fakeSupabase>[0]["results"]) {
  vi.mocked(createClient).mockResolvedValue(fakeSupabase({ results }).client as never);
  render(await DashboardPage());
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("DashboardPage", () => {
  it.each(["products", "schedule_items", "schedule_completions", "maintenance_reminders"])(
    "shows an error state (not empty 'no data' states) when the %s read fails",
    async (table) => {
      await renderDashboard({
        [`${table}.select`]: { error: { message: "permission denied", code: "42501" } },
      });

      expect(screen.getByRole("alert")).toHaveTextContent("לא הצלחנו לטעון את לוח הבקרה");
      expect(screen.queryByText(EMPTY_PRODUCTS_TEXT)).toBeNull();
      expect(screen.queryByText(EMPTY_REMINDERS_TEXT)).toBeNull();
      expect(console.error).toHaveBeenCalled();
    }
  );

  it("control: successful empty reads show the empty states and no error", async () => {
    await renderDashboard({
      "products.select": { data: [] },
      "schedule_items.select": { data: [] },
      "schedule_completions.select": { data: [] },
      "maintenance_reminders.select": { data: [] },
    });

    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText(EMPTY_PRODUCTS_TEXT)).toBeInTheDocument();
    expect(screen.getByText(EMPTY_REMINDERS_TEXT)).toBeInTheDocument();
  });
});
