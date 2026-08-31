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

// מילות מפתח (עברית/אנגלית/ראשי תיבות נפוצים) לזיהוי רכיב פעיל מתוך שם
// המוצר או המותג בלבד — ידע כללי על איך רכיבים נקראים בפועל על גבי
// אריזות, בלי חיפוש אינטרנט ובלי קריאה ל-API חיצוני. אותה גישה כמו
// categorizeDevice/categorizeProduct: טקסט חופשי, לא שדה סגור.
const INGREDIENT_KEYWORDS: Record<IngredientKey, RegExp> = {
  retinol: /רטינול|רטינה|retinol|retinal|retin-?a/i,
  vitamin_c: /ויטמין\s?c|ויטמין\s?סי|וי[ט]מין\s?סי|אסקורבי|vitamin\s?c|ascorbic/i,
  niacinamide: /ניאצינאמיד|niacinamide/i,
  aha: /\baha\b|גליקוליק|לקטיק|חומצת פירות|חומצה גליקולית|glycolic|lactic/i,
  bha: /\bbha\b|סליציליק|חומצה סליצילית|salicylic/i,
  benzoyl_peroxide: /בנזואיל|בנזוייל|benzoyl/i,
  spf: /\bspf\b|הגנה מהשמש|קרם הגנה|sunscreen/i,
  hyaluronic_acid: /היאלורוני|hyaluronic/i,
  peptides: /פפטיד|peptide/i,
  hydroquinone: /הידרוקינון|hydroquinone/i,
  azelaic_acid: /אזלאי|azelaic/i,
};

/**
 * מזהה רכיבים פעילים סבירים מתוך שם המוצר והמותג בלבד, לפי מילות מפתח
 * ידועות (ללא חיפוש אינטרנט וללא קריאה ל-AI חיצוני). מוחזרת רשימה ריקה
 * כשלא נמצאה התאמה בטוחה — כדי לא "לנחש" רכיב שלא באמת מוזכר בטקסט.
 */
export function detectIngredientsFromText(name: string, brand: string): IngredientKey[] {
  const text = `${name} ${brand}`.trim();
  if (!text) return [];

  return (Object.keys(INGREDIENT_KEYWORDS) as IngredientKey[]).filter((ing) =>
    INGREDIENT_KEYWORDS[ing].test(text)
  );
}

export interface ProductSuggestionInput {
  name: string;
  brand: string;
  category: string;
  activeIngredients: IngredientKey[];
}

export interface ProductSuggestion {
  skinBenefits: string;
  avoidMixingWith: string;
  /** רכיבים שזוהו אוטומטית משם/מותג המוצר (כשלא היו רכיבים מסומנים מראש) —
   *  טרם אושרו ידנית, ולכן ראוי לסמן אותם בטופס עד שהמשתמשת בודקת אותם. */
  detectedIngredients: IngredientKey[];
}

/**
 * טיוטה ראשונית ל"יתרונות לעור" ו"לא לערבב עם". אם כבר סומנו רכיבים
 * פעילים בטופס — מתבססת עליהם. אם לא, מנסה לזהות רכיב סביר משם/מותג
 * המוצר בלבד (detectIngredientsFromText); אם גם זה לא מניב התאמה בטוחה,
 * מחזירה טיוטה ריקה מרכיב במפורש במקום לנחש. בכל מקרה מיועדת לעריכה
 * ואישור על ידי המשתמשת לפני שמירה, לא לשמירה אוטומטית.
 */
export function suggestProductNotes({
  name,
  brand,
  category,
  activeIngredients,
}: ProductSuggestionInput): ProductSuggestion {
  const label = [name, brand].filter(Boolean).join(" מבית ") || "המוצר";

  let ingredientsForNotes = activeIngredients;
  let detectedIngredients: IngredientKey[] = [];
  let noIngredientDetected = false;

  if (activeIngredients.length === 0) {
    const detected = detectIngredientsFromText(name, brand);
    if (detected.length > 0) {
      ingredientsForNotes = detected;
      detectedIngredients = detected;
    } else {
      noIngredientDetected = true;
    }
  }

  let skinBenefits: string;
  if (ingredientsForNotes.length > 0) {
    const ingredientNames = ingredientsForNotes.map((ing) => INGREDIENT_LABELS[ing]).join(", ");
    const sentences = ingredientsForNotes
      .map((ing) => `${INGREDIENT_LABELS[ing]} ${INGREDIENT_BENEFITS[ing]}.`)
      .join(" ");
    const detectedNote =
      detectedIngredients.length > 0
        ? " (זוהה אוטומטית משם/מותג המוצר — יש לבדוק ולאשר למעלה.)"
        : "";
    skinBenefits = `${label} מכיל ${ingredientNames}.${detectedNote} ${sentences}`;
  } else if (noIngredientDetected) {
    skinBenefits = `${label}${category ? ` (${category})` : ""} — לא זוהה רכיב פעיל ידוע משם המוצר או המותג. אפשר לסמן רכיב פעיל ידנית למעלה וללחוץ שוב, או להשלים את הטיוטה כאן.`;
  } else {
    skinBenefits = `${label}${category ? ` (${category})` : ""} — טיוטה ראשונית. אפשר לערוך ולפרט כאן מה המוצר עושה לעור.`;
  }

  const partners = getKnownConflictPartners(ingredientsForNotes);
  const avoidMixingWith =
    partners.length > 0
      ? partners.map((p) => `${INGREDIENT_LABELS[p.ingredient]} — ${p.reason}`).join("\n")
      : "לא ידועים במערכת קונפליקטים נפוצים עם הרכיבים שסומנו. אפשר להוסיף כאן שילוב בעייתי ספציפי אם ידוע.";

  return { skinBenefits, avoidMixingWith, detectedIngredients };
}
