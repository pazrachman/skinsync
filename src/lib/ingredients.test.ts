import { describe, expect, it } from "vitest";
import {
  findConflicts,
  findConflictsInProducts,
  getKnownConflictPartners,
} from "./ingredients";
import { detectIngredientsFromText } from "./productSuggestions";
import type { IngredientKey } from "./types";

describe("findConflicts", () => {
  it("רשימה ריקה — []", () => {
    expect(findConflicts([])).toEqual([]);
  });

  it("רכיב בודד — [] (אין קונפליקט עם עצמו)", () => {
    expect(findConflicts(["retinol"])).toEqual([]);
  });

  it("שני רכיבים בטוחים יחד — []", () => {
    expect(findConflicts(["niacinamide", "hyaluronic_acid"])).toEqual([]);
  });

  it("רטינול + AHA — קונפליקט אחד, עם reason", () => {
    const conflicts = findConflicts(["retinol", "aha"]);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].a).toBe("retinol");
    expect(conflicts[0].b).toBe("aha");
    expect(conflicts[0].reason.length).toBeGreaterThan(0);
  });

  it("רטינול + AHA + BHA יחד — 3 קונפליקטים (כל הזוגות הידועים)", () => {
    const conflicts = findConflicts(["retinol", "aha", "bha"]);
    expect(conflicts).toHaveLength(3);
  });

  it("רכיב כפול ברשימה — לא נספר כקונפליקט עם עצמו", () => {
    expect(findConflicts(["retinol", "retinol"])).toEqual([]);
  });

  it("מפתח רכיב לא מוכר — לא זורק שגיאה, פשוט לא משתתף", () => {
    const fakeIngredient = "not_a_real_ingredient" as IngredientKey;
    expect(() => findConflicts([fakeIngredient, "retinol"])).not.toThrow();
    expect(findConflicts([fakeIngredient, "retinol"])).toEqual([]);
  });

  it("מוצרים בלי רכיבים כלל — []", () => {
    expect(findConflicts([])).toEqual([]);
  });
});

describe("findConflictsInProducts", () => {
  it("קונפליקט בין 2 מוצרים שונים — מזוהה, לא רק בתוך מוצר אחד", () => {
    const conflicts = findConflictsInProducts([
      { active_ingredients: ["retinol"] },
      { active_ingredients: ["vitamin_c"] },
    ]);
    expect(conflicts).toHaveLength(1);
    expect([conflicts[0].a, conflicts[0].b].sort()).toEqual(["retinol", "vitamin_c"].sort());
  });

  it("מוצרים בטוחים בשני חפצים נפרדים — []", () => {
    const conflicts = findConflictsInProducts([
      { active_ingredients: ["niacinamide"] },
      { active_ingredients: ["hyaluronic_acid"] },
    ]);
    expect(conflicts).toEqual([]);
  });
});

describe("getKnownConflictPartners", () => {
  it("רשימה ריקה — []", () => {
    expect(getKnownConflictPartners([])).toEqual([]);
  });

  it("רטינול לבד — כל 4 השותפים הידועים שלו (aha, bha, benzoyl_peroxide, vitamin_c)", () => {
    const partners = getKnownConflictPartners(["retinol"]).map((p) => p.ingredient).sort();
    expect(partners).toEqual(["aha", "benzoyl_peroxide", "bha", "vitamin_c"].sort());
  });

  it("רטינול + AHA ביחד — הזוג ביניהם לא חוזר, אבל שאר השותפים כן (dedup לפי רכיב)", () => {
    const partners = getKnownConflictPartners(["retinol", "aha"]).map((p) => p.ingredient).sort();
    // vitamin_c מגיע גם מ-retinol וגם מ-aha, אבל אמור להופיע פעם אחת בלבד
    expect(partners).toEqual(["benzoyl_peroxide", "bha", "vitamin_c"].sort());
    expect(new Set(partners).size).toBe(partners.length);
  });
});

describe("detectIngredientsFromText", () => {
  it("מזהה רכיב לפי מילת מפתח בעברית בשם המוצר", () => {
    expect(detectIngredientsFromText("סרום רטינול ללילה", "")).toContain("retinol");
  });

  it("מזהה רכיב לפי מילת מפתח באנגלית", () => {
    expect(detectIngredientsFromText("Vitamin C Serum", "")).toContain("vitamin_c");
  });

  it("מזהה רכיב מתוך שם המותג, לא רק שם המוצר", () => {
    expect(detectIngredientsFromText("Serum", "The Ordinary Niacinamide")).toContain("niacinamide");
  });

  it("שם/מותג בלי שום מילת מפתח ידועה — [] ('לא זוהה')", () => {
    expect(detectIngredientsFromText("קרם פנים יומי", "מותג כלשהו")).toEqual([]);
  });

  it("טקסט ריק — []", () => {
    expect(detectIngredientsFromText("", "")).toEqual([]);
  });

  it("'אלפא ארבוטין' מזהה alpha_arbutin, ולא arbutin (מונע כפילות שם דומה)", () => {
    const detected = detectIngredientsFromText("קרם אלפא ארבוטין", "");
    expect(detected).toContain("alpha_arbutin");
    expect(detected).not.toContain("arbutin");
  });

  it("'ארבוטין' לבד (בלי 'אלפא') מזהה arbutin בלבד", () => {
    const detected = detectIngredientsFromText("סרום ארבוטין", "");
    expect(detected).toContain("arbutin");
    expect(detected).not.toContain("alpha_arbutin");
  });

  it("'זינק אוקסייד' מזהה zinc_oxide, ולא את הרכיב הכללי zinc", () => {
    const detected = detectIngredientsFromText("קרם הגנה זינק אוקסייד", "");
    expect(detected).toContain("zinc_oxide");
    expect(detected).not.toContain("zinc");
  });

  it("'אבץ' לבד (בלי 'תחמוצת'/'אוקסייד') מזהה zinc בלבד", () => {
    const detected = detectIngredientsFromText("קרם אבץ להרגעת עור", "");
    expect(detected).toContain("zinc");
    expect(detected).not.toContain("zinc_oxide");
  });

  it("יכול לזהות כמה רכיבים בו-זמנית מאותו טקסט", () => {
    const detected = detectIngredientsFromText("סרום ניאצינאמיד + חומצה היאלורונית", "");
    expect(detected).toContain("niacinamide");
    expect(detected).toContain("hyaluronic_acid");
  });
});
