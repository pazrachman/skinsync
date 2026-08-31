import type { IngredientKey, Product } from "./types";

export const INGREDIENT_LABELS: Record<IngredientKey, string> = {
  // חומצות
  aha: "AHA (חומצות פירות, כללי)",
  bha: "BHA (חומצה סליצילית)",
  glycolic_acid: "חומצה גליקולית",
  mandelic_acid: "חומצה מנדלית",
  lactic_acid: "חומצה לקטית",
  tartaric_acid: "חומצה טרטרית",
  pha: "PHA (פוליהידרוקסי)",
  lha: "LHA",
  azelaic_acid: "חומצה אזלאית",
  // ויטמינים ונוגדי חמצון
  vitamin_c: "ויטמין C",
  vitamin_e: "ויטמין E",
  retinol: "רטינול",
  retinaldehyde: "רטינאלדהיד / רטינל",
  niacinamide: "ניאצינאמיד",
  coenzyme_q10: "קואנזים Q10",
  green_tea: "תה ירוק (EGCG)",
  ferulic_acid: "פרולה אסיד",
  resveratrol: "רזברטרול",
  // פפטידים ותומכי מבנה
  peptides: "פפטידים",
  collagen: "קולגן",
  elastin: "אלסטין",
  copper_peptides: "קופר פפטיד (נחושת)",
  // לחות ומחסום עור
  hyaluronic_acid: "חומצה היאלורונית",
  glycerin: "גליצרין",
  squalane: "סקוואלן",
  jojoba_oil: "שמן ג'וג'ובה",
  ceramides: "צרמידים",
  aloe_vera: "אלוורה",
  panthenol: "פאנתנול (ויטמין B5)",
  // הבהרה ופיגמנטציה
  hydroquinone: "הידרוקינון",
  arbutin: "ארבוטין",
  alpha_arbutin: "אלפא ארבוטין",
  tranexamic_acid: "טרנקסמיק אסיד",
  kojic_acid: "קוג'יק אסיד",
  licorice_root: "ליקריץ רוט (שורש שוש)",
  // אקנה וטיפול ממוקד
  benzoyl_peroxide: "בנזואיל פרוקסייד",
  sulfur: "גופרית",
  tea_tree_oil: "שמן עץ התה",
  zinc: "אבץ (זינק)",
  // הגנה מהשמש
  spf: "קרם הגנה SPF",
  zinc_oxide: "זינק אוקסייד",
  titanium_dioxide: "טיטניום דיוקסייד",
};

export const ALL_INGREDIENTS: IngredientKey[] = Object.keys(
  INGREDIENT_LABELS
) as IngredientKey[];

export interface IngredientGroup {
  id: string;
  label: string;
  ingredients: IngredientKey[];
}

/**
 * קיבוץ הרכיבים לקטגוריות הגיוניות לתצוגה בטופס — כדי שרשימה של עשרות
 * רכיבים לא תיראה כמו גוש אחד עמוס. לא משפיע על האחסון או על הזיהוי
 * האוטומטי, רק על הסידור הוויזואלי.
 */
export const INGREDIENT_GROUPS: IngredientGroup[] = [
  {
    id: "acids",
    label: "חומצות",
    ingredients: [
      "aha",
      "glycolic_acid",
      "mandelic_acid",
      "lactic_acid",
      "tartaric_acid",
      "pha",
      "bha",
      "lha",
      "azelaic_acid",
    ],
  },
  {
    id: "vitamins",
    label: "ויטמינים ונוגדי חמצון",
    ingredients: [
      "vitamin_c",
      "vitamin_e",
      "retinol",
      "retinaldehyde",
      "niacinamide",
      "coenzyme_q10",
      "green_tea",
      "ferulic_acid",
      "resveratrol",
    ],
  },
  {
    id: "peptides",
    label: "פפטידים ותומכי מבנה",
    ingredients: ["peptides", "collagen", "elastin", "copper_peptides"],
  },
  {
    id: "hydration",
    label: "לחות ומחסום עור",
    ingredients: [
      "hyaluronic_acid",
      "glycerin",
      "squalane",
      "jojoba_oil",
      "ceramides",
      "aloe_vera",
      "panthenol",
    ],
  },
  {
    id: "brightening",
    label: "הבהרה ופיגמנטציה",
    ingredients: [
      "hydroquinone",
      "arbutin",
      "alpha_arbutin",
      "tranexamic_acid",
      "kojic_acid",
      "licorice_root",
    ],
  },
  {
    id: "acne",
    label: "אקנה וטיפול ממוקד",
    ingredients: ["benzoyl_peroxide", "sulfur", "tea_tree_oil", "zinc"],
  },
  {
    id: "protection",
    label: "הגנה מהשמש",
    ingredients: ["spf", "zinc_oxide", "titanium_dioxide"],
  },
];

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
