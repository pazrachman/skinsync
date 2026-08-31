import { getKnownConflictPartners, INGREDIENT_LABELS } from "./ingredients";
import type { IngredientKey } from "./types";

// משפט יתרון קצר לכל רכיב פעיל — מאוחדים יחד לטיוטת "יתרונות לעור".
// ידע כללי בטיפוח, לא ייעוץ רפואי — המשתמשת עורכת ומאשרת לפני שמירה.
const INGREDIENT_BENEFITS: Record<IngredientKey, string> = {
  retinol: "מסייע בחידוש תאי העור, מפחית קמטים עדינים ומשפר את מרקם העור",
  vitamin_c: "נוגד חמצון שמבהיר את גוון העור ותומך בייצור קולגן",
  niacinamide: "מרגיע גירויים, מצמצם מראה נקבוביות ומחזק את מחסום העור",
  aha: "מקלף תאי עור מתים ומשפר זוהר וטקסטורת העור",
  bha: "חודר לעומק הנקבוביות ומסייע נגד אקנה ופוריות",
  benzoyl_peroxide: "פועל נגד חיידקי אקנה ומסייע בהפחתת דלקות",
  spf: "מגן מפני קרינת UV ומאט הזדקנות מוקדמת של העור",
  hyaluronic_acid: "מספק לחות עמוקה ומעניק מראה מלא ורענן",
  peptides: "תומך בייצור קולגן ומשפר גמישות ומרקם העור",
  hydroquinone: "מסייע בהבהרת כתמי גיל ופיגמנטציה",
  azelaic_acid: "מרגיע אדמומיות, מסייע נגד אקנה ומבהיר כתמים",
};

export interface ProductSuggestionInput {
  name: string;
  brand: string;
  category: string;
  activeIngredients: IngredientKey[];
}

export interface ProductSuggestion {
  skinBenefits: string;
  avoidMixingWith: string;
}

/**
 * טיוטה ראשונית ל"יתרונות לעור" ו"לא לערבב עם", מבוססת על הרכיבים
 * הפעילים שסומנו בטופס (ידע קיים במערכת — לא קריאה ל-AI חיצוני).
 * מיועדת לעריכה ואישור על ידי המשתמשת לפני שמירה, לא לשמירה אוטומטית.
 */
export function suggestProductNotes({
  name,
  brand,
  category,
  activeIngredients,
}: ProductSuggestionInput): ProductSuggestion {
  const label = [name, brand].filter(Boolean).join(" מבית ") || "המוצר";

  let skinBenefits: string;
  if (activeIngredients.length > 0) {
    const ingredientNames = activeIngredients.map((ing) => INGREDIENT_LABELS[ing]).join(", ");
    const sentences = activeIngredients
      .map((ing) => `${INGREDIENT_LABELS[ing]} ${INGREDIENT_BENEFITS[ing]}.`)
      .join(" ");
    skinBenefits = `${label} מכיל ${ingredientNames}. ${sentences}`;
  } else {
    skinBenefits = `${label}${category ? ` (${category})` : ""} — טיוטה ראשונית. אפשר לערוך ולפרט כאן מה המוצר עושה לעור.`;
  }

  const partners = getKnownConflictPartners(activeIngredients);
  const avoidMixingWith =
    partners.length > 0
      ? partners.map((p) => `${INGREDIENT_LABELS[p.ingredient]} — ${p.reason}`).join("\n")
      : "לא ידועים במערכת קונפליקטים נפוצים עם הרכיבים שסומנו. אפשר להוסיף כאן שילוב בעייתי ספציפי אם ידוע.";

  return { skinBenefits, avoidMixingWith };
}
