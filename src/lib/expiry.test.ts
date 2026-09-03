import { describe, expect, it } from "vitest";
import { getExpiryInfo, getReminderDueInfo } from "./expiry";

// תאריך "היום" קבוע לכל הבדיקות בקובץ הזה, כדי שהתוצאה תהיה דטרמיניסטית
// ולא תלויה במתי בפועל מריצים את הבדיקה.
const TODAY = new Date("2026-06-15T00:00:00.000Z");

describe("getExpiryInfo", () => {
  it("בלי open_date ובלי override — unopened, בלי תאריך/ימים", () => {
    const info = getExpiryInfo(
      { open_date: null, shelf_life_months: 12, expiry_date_override: null },
      TODAY
    );
    expect(info.status).toBe("unopened");
    expect(info.expiryDate).toBeNull();
    expect(info.daysLeft).toBeNull();
  });

  it("נפתח, רחוק מהתפוגה — fresh", () => {
    const info = getExpiryInfo(
      { open_date: "2026-01-01", shelf_life_months: 12, expiry_date_override: null },
      TODAY
    );
    expect(info.status).toBe("fresh");
    expect(info.daysLeft).toBeGreaterThan(30);
  });

  it("נפתח, מזמן — expired", () => {
    const info = getExpiryInfo(
      { open_date: "2025-01-01", shelf_life_months: 6, expiry_date_override: null },
      TODAY
    );
    expect(info.status).toBe("expired");
    expect(info.daysLeft).toBeLessThan(0);
  });

  it("בדיוק 30 יום עד תפוגה — soon (הגבול כלול)", () => {
    const info = getExpiryInfo(
      { open_date: null, shelf_life_months: 6, expiry_date_override: "2026-07-15" },
      TODAY
    );
    expect(info.daysLeft).toBe(30);
    expect(info.status).toBe("soon");
  });

  it("בדיוק 31 יום עד תפוגה — fresh (צעד אחד מעבר לגבול)", () => {
    const info = getExpiryInfo(
      { open_date: null, shelf_life_months: 6, expiry_date_override: "2026-07-16" },
      TODAY
    );
    expect(info.daysLeft).toBe(31);
    expect(info.status).toBe("fresh");
  });

  it("פג תוקף בדיוק היום (0 ימים) — soon, לא expired", () => {
    const info = getExpiryInfo(
      { open_date: null, shelf_life_months: 6, expiry_date_override: "2026-06-15" },
      TODAY
    );
    expect(info.daysLeft).toBe(0);
    expect(info.status).toBe("soon");
  });

  it("פג תוקף אתמול (-1 יום) — expired", () => {
    const info = getExpiryInfo(
      { open_date: null, shelf_life_months: 6, expiry_date_override: "2026-06-14" },
      TODAY
    );
    expect(info.daysLeft).toBe(-1);
    expect(info.status).toBe("expired");
  });

  it("override סותר open_date שהיה מחזיר expired — override גובר", () => {
    const info = getExpiryInfo(
      {
        open_date: "2020-01-01", // לבד היה נותן expired מזמן
        shelf_life_months: 1,
        expiry_date_override: "2030-01-01", // אבל ה-override רחוק בעתיד
      },
      TODAY
    );
    expect(info.status).toBe("fresh");
  });

  it("override בלי open_date בכלל — עדיין מחושב (לא unopened)", () => {
    const info = getExpiryInfo(
      { open_date: null, shelf_life_months: 6, expiry_date_override: "2026-07-20" },
      TODAY
    );
    expect(info.status).not.toBe("unopened");
    expect(info.expiryDate).not.toBeNull();
  });

  it("תאריך override לא תקין — לא זורק שגיאה; daysLeft הופך ל-NaN וה-status נופל ל-fresh (התנהגות בפועל, לא ספסיפיקציה רצויה)", () => {
    expect(() =>
      getExpiryInfo(
        { open_date: null, shelf_life_months: 6, expiry_date_override: "not-a-real-date" },
        TODAY
      )
    ).not.toThrow();

    const info = getExpiryInfo(
      { open_date: null, shelf_life_months: 6, expiry_date_override: "not-a-real-date" },
      TODAY
    );
    expect(Number.isNaN(info.daysLeft)).toBe(true);
    // NaN < 0 ו-NaN <= 30 שניהם false, אז הלוגיקה נופלת ל-fresh כברירת מחדל —
    // זו נקודה כדאי להיות מודעים אליה, לא התנהגות "נכונה" במובן מוצרי.
    expect(info.status).toBe("fresh");
  });
});

describe("getReminderDueInfo", () => {
  it("מעולם לא בוצעה — never_done", () => {
    const info = getReminderDueInfo({ last_done_on: null, cadence_days: 7 }, TODAY);
    expect(info.status).toBe("never_done");
    expect(info.nextDueDate).toBeNull();
    expect(info.daysLeft).toBeNull();
  });

  it("הרבה ימים עד המועד הבא — ok", () => {
    const info = getReminderDueInfo({ last_done_on: "2026-06-01", cadence_days: 60 }, TODAY);
    expect(info.status).toBe("ok");
    expect(info.daysLeft).toBeGreaterThan(2);
  });

  it("בדיוק יומיים עד המועד — due_soon (הגבול כלול)", () => {
    // last_done 2026-06-10 + 7 ימים = 2026-06-17 = TODAY + 2
    const info = getReminderDueInfo({ last_done_on: "2026-06-10", cadence_days: 7 }, TODAY);
    expect(info.daysLeft).toBe(2);
    expect(info.status).toBe("due_soon");
  });

  it("בדיוק 3 ימים עד המועד — ok (צעד אחד מעבר לגבול)", () => {
    // last_done 2026-06-10 + 8 ימים = 2026-06-18 = TODAY + 3
    const info = getReminderDueInfo({ last_done_on: "2026-06-10", cadence_days: 8 }, TODAY);
    expect(info.daysLeft).toBe(3);
    expect(info.status).toBe("ok");
  });

  it("המועד היום בדיוק (0 ימים) — due_soon", () => {
    // last_done 2026-06-08 + 7 ימים = 2026-06-15 = TODAY
    const info = getReminderDueInfo({ last_done_on: "2026-06-08", cadence_days: 7 }, TODAY);
    expect(info.daysLeft).toBe(0);
    expect(info.status).toBe("due_soon");
  });

  it("המועד כבר עבר — overdue", () => {
    const info = getReminderDueInfo({ last_done_on: "2026-06-01", cadence_days: 7 }, TODAY);
    expect(info.daysLeft).toBeLessThan(0);
    expect(info.status).toBe("overdue");
  });

  it("cadence_days=0 ובוצע היום — due_soon (המשימה 'חוזרת' מיד)", () => {
    const info = getReminderDueInfo({ last_done_on: "2026-06-15", cadence_days: 0 }, TODAY);
    expect(info.daysLeft).toBe(0);
    expect(info.status).toBe("due_soon");
  });
});
