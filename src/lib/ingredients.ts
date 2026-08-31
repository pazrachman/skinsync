import type { IngredientKey, Product } from "./types";

export const INGREDIENT_LABELS: Record<IngredientKey, string> = {
  retinol: "רטינול",
  vitamin_c: "ויטמין C",
  niacinamide: "ניאצינאמיד",
  aha: "AHA (חומצות פירות)",
  bha: "BHA (חומצה סליצילית)",
  benzoyl_peroxide: "בנזואיל פרוקסייד",
  spf: "קרם הגנה SPF",
  hyaluronic_acid: "חומצה היאלורונית",
  peptides: "פפטידים",
  hydroquinone: "הידרוקינון",
  azelaic_acid: "חומצה אזלאית",
};

export const ALL_INGREDIENTS: IngredientKey[] = Object.keys(
  INGREDIENT_LABELS
) as IngredientKey[];

interface ConflictRule {
  pair: [IngredientKey, IngredientKey];
  reason: string;
}

/**
 * מטריצת קונפליקטים בין רכיבים פעילים.
 * זהו כלי עזר כללי ולא תחליף לייעוץ דרמטולוגי מקצועי.
 */
const CONFLICT_RULES: ConflictRule[] = [
  {
    pair: ["retinol", "aha"],
    reason: "רטינול + AHA עלולים לגרום לגירוי ויובש מוגזם כשמשתמשים בהם באותה שגרה.",
  },
  {
    pair: ["retinol", "bha"],
    reason: "רטינול + BHA עלולים להגביר רגישות וקילוף עודף.",
  },
  {
    pair: ["retinol", "benzoyl_peroxide"],
    reason: "רטינול + בנזואיל פרוקסייד עלולים לנטרל זה את זה ולגרום לגירוי חזק.",
  },
  {
    pair: ["retinol", "vitamin_c"],
    reason: "רטינול וויטמין C יציבים בטווחי pH שונים; עדיף להפריד לבוקר/ערב.",
  },
  {
    pair: ["vitamin_c", "aha"],
    reason: "ויטמין C + AHA יחד עלולים להגביר גירוי בעור רגיש.",
  },
  {
    pair: ["vitamin_c", "bha"],
    reason: "ויטמין C + BHA יחד עלולים להגביר גירוי בעור רגיש.",
  },
  {
    pair: ["aha", "bha"],
    reason: "שילוב שתי חומצות קילוף באותה שגרה מעלה סיכון לפגיעה במחסום העור.",
  },
  {
    pair: ["benzoyl_peroxide", "vitamin_c"],
    reason: "בנזואיל פרוקסייד עלול לחמצן ולנטרל ויטמין C מסוג L-אסקורבית.",
  },
];

export interface ConflictWarning {
  a: IngredientKey;
  b: IngredientKey;
  reason: string;
}

/** בודק קונפליקטים בין רשימת רכיבים פעילים (למשל כל המוצרים המשובצים לאותו סלוט) */
export function findConflicts(ingredients: IngredientKey[]): ConflictWarning[] {
  const unique = Array.from(new Set(ingredients));
  const warnings: ConflictWarning[] = [];

  for (const rule of CONFLICT_RULES) {
    const [x, y] = rule.pair;
    if (unique.includes(x) && unique.includes(y)) {
      warnings.push({ a: x, b: y, reason: rule.reason });
    }
  }

  return warnings;
}

/** נוחות: בודק קונפליקטים ישירות מרשימת מוצרים */
export function findConflictsInProducts(products: Pick<Product, "active_ingredients">[]): ConflictWarning[] {
  const allIngredients = products.flatMap((p) => p.active_ingredients ?? []);
  return findConflicts(allIngredients);
}

export interface ConflictPartner {
  ingredient: IngredientKey;
  reason: string;
}

/**
 * עבור רשימת רכיבים פעילים של מוצר אחד, מחזיר את כל הרכיבים הידועים
 * כלא-מומלצים לשילוב — גם אם הרכיב השני עצמו לא נמצא באותו מוצר (למשל
 * "רטינול" מחזיר אזהרה על "ויטמין C" גם אם למוצר הזה אין ויטמין C).
 * זה שונה מ-findConflicts, שמאתר התנגשות רק בין רכיבים שכולם כבר ברשימה.
 */
export function getKnownConflictPartners(ingredients: IngredientKey[]): ConflictPartner[] {
  const set = new Set(ingredients);
  const partners = new Map<IngredientKey, string>();

  for (const rule of CONFLICT_RULES) {
    const [a, b] = rule.pair;
    if (set.has(a) && !set.has(b)) partners.set(b, rule.reason);
    if (set.has(b) && !set.has(a)) partners.set(a, rule.reason);
  }

  return Array.from(partners, ([ingredient, reason]) => ({ ingredient, reason }));
}
