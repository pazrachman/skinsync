import { describe, expect, it } from "vitest";
import { isIsoDate, isValidWeekday, parseWeekdayField, parseWeekdays } from "./validation";

describe("isValidWeekday", () => {
  it.each([0, 1, 2, 3, 4, 5, 6])("accepts %d", (d) => {
    expect(isValidWeekday(d)).toBe(true);
  });

  it.each([-1, 7, 8, 2.5, NaN, Infinity, -Infinity, "3", null, undefined, [3], {}])(
    "rejects %j",
    (v) => {
      expect(isValidWeekday(v)).toBe(false);
    }
  );
});

describe("parseWeekdayField (FormData strings)", () => {
  it.each([["0", 0], ["3", 3], ["6", 6]])("parses %j → %d", (raw, n) => {
    expect(parseWeekdayField(raw)).toBe(n);
  });

  it.each(["-1", "7", "8", "2.5", "NaN", "", " 3", "3 ", "03", "3.0", "1e0", "abc", "Infinity"])(
    "rejects %j",
    (raw) => {
      expect(parseWeekdayField(raw)).toBeNull();
    }
  );

  it.each([3, 2.5, NaN, null, undefined])("rejects non-string %j (not form input)", (raw) => {
    expect(parseWeekdayField(raw)).toBeNull();
  });
});

describe("parseWeekdays", () => {
  it("dedupes and sorts", () => {
    expect(parseWeekdays(["6", "1", "1", "0"])).toEqual({ ok: true, days: [0, 1, 6] });
  });

  it("rejects the whole input if any value is invalid (no silent dropping)", () => {
    expect(parseWeekdays(["1", "8"])).toEqual({ ok: false });
  });
});

describe("isIsoDate", () => {
  it("accepts a real calendar date", () => {
    expect(isIsoDate("2026-11-09")).toBe(true);
  });

  it.each(["2026-02-30", "2026-13-01", "09-11-2026", "2026-11-9", "", "x", 20261109])(
    "rejects %j",
    (v) => {
      expect(isIsoDate(v)).toBe(false);
    }
  );
});
