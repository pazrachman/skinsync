// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/actions/schedule", () => ({
  toggleCompletion: vi.fn(),
  addScheduleItem: vi.fn(),
  deleteScheduleItem: vi.fn(),
}));

import ScheduleGrid from "@/components/ScheduleGrid";
import TodayRoutine from "@/components/TodayRoutine";
import { deleteScheduleItem, toggleCompletion } from "@/lib/actions/schedule";
import { ERR_SAVE_FAILED } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import type { Product, ScheduleItem } from "@/lib/types";

const DATE = "2026-11-09";

const product = {
  id: "p1",
  name: "Hyaluronic serum",
  active_ingredients: [],
} as unknown as Product;

const item: ScheduleItem = {
  id: "item-1",
  user_id: "u1",
  product_id: "p1",
  days_of_week: [0, 1, 2, 3, 4, 5, 6],
  time_of_day: "morning",
  sort_order: 0,
  created_at: "",
  product,
};

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

afterEach(() => {
  cleanup();
  vi.mocked(toggleCompletion).mockReset();
  vi.mocked(deleteScheduleItem).mockReset();
});

describe("TodayRoutine", () => {
  it("shows the tick optimistically, then reverts it and shows an error when the save fails", async () => {
    const pending = deferred<ActionResult>();
    vi.mocked(toggleCompletion).mockReturnValue(pending.promise);

    render(<TodayRoutine items={[item]} completedIds={new Set()} date={DATE} />);
    const checkbox = screen.getByRole("checkbox", { name: "Hyaluronic serum" });
    expect(checkbox).not.toBeChecked();

    act(() => {
      fireEvent.click(checkbox);
    });
    expect(toggleCompletion).toHaveBeenCalledWith("item-1", DATE, false);
    expect(checkbox).toBeChecked(); // optimistic
    expect(screen.queryByRole("alert")).toBeNull();

    await act(async () => {
      pending.resolve({ error: ERR_SAVE_FAILED });
    });

    expect(checkbox).not.toBeChecked(); // reverted — not shown as saved
    expect(screen.getByRole("alert")).toHaveTextContent(ERR_SAVE_FAILED);
  });

  it("shows an error when the request itself throws (network down)", async () => {
    vi.mocked(toggleCompletion).mockRejectedValue(new Error("fetch failed"));

    render(<TodayRoutine items={[item]} completedIds={new Set()} date={DATE} />);
    const checkbox = screen.getByRole("checkbox", { name: "Hyaluronic serum" });
    await act(async () => {
      fireEvent.click(checkbox);
    });

    expect(checkbox).not.toBeChecked();
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("un-ticking a saved completion that fails to delete stays ticked", async () => {
    vi.mocked(toggleCompletion).mockResolvedValue({ error: ERR_SAVE_FAILED });

    render(<TodayRoutine items={[item]} completedIds={new Set(["item-1"])} date={DATE} />);
    const checkbox = screen.getByRole("checkbox", { name: "Hyaluronic serum" });
    expect(checkbox).toBeChecked();

    await act(async () => {
      fireEvent.click(checkbox);
    });

    expect(toggleCompletion).toHaveBeenCalledWith("item-1", DATE, true);
    expect(checkbox).toBeChecked();
    expect(screen.getByRole("alert")).toHaveTextContent(ERR_SAVE_FAILED);
  });

  it("no error is shown on success", async () => {
    vi.mocked(toggleCompletion).mockResolvedValue({ error: null });
    render(<TodayRoutine items={[item]} completedIds={new Set()} date={DATE} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("checkbox", { name: "Hyaluronic serum" }));
    });
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("ScheduleGrid", () => {
  const weekDates = ["2026-11-08", "2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14"];

  it("reverts a failed completion toggle and shows the error", async () => {
    vi.mocked(toggleCompletion).mockResolvedValue({ error: ERR_SAVE_FAILED });

    render(
      <ScheduleGrid products={[product]} scheduleItems={[item]} completions={[]} weekDates={weekDates} />
    );
    const boxes = screen.getAllByRole("checkbox", { name: "Hyaluronic serum" });
    expect(boxes).toHaveLength(7);

    await act(async () => {
      fireEvent.click(boxes[1]);
    });

    expect(toggleCompletion).toHaveBeenCalledWith("item-1", "2026-11-09", false);
    expect(boxes[1]).not.toBeChecked();
    expect(screen.getByRole("alert")).toHaveTextContent(ERR_SAVE_FAILED);
  });

  it("shows an error when removing a schedule item fails", async () => {
    vi.mocked(deleteScheduleItem).mockResolvedValue({ error: ERR_SAVE_FAILED });

    render(
      <ScheduleGrid products={[product]} scheduleItems={[item]} completions={[]} weekDates={weekDates} />
    );
    await act(async () => {
      fireEvent.click(screen.getAllByTitle("הסרה מהשגרה")[0]);
    });

    expect(deleteScheduleItem).toHaveBeenCalledWith("item-1");
    expect(screen.getByRole("alert")).toHaveTextContent(ERR_SAVE_FAILED);
  });
});
