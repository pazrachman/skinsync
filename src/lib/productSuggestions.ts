import { getKnownConflictPartners, INGREDIENT_LABELS } from "./ingredients";
import type { IngredientKey } from "./types";

// משפט יתרון קצר לכל רכיב פעיל — מאוחדים יחד לטיוטת "יתרונות לעור".
// ידע כללי בטיפוח, לא ייעוץ רפואי — המשתמשת עורכת ומאשרת לפני שמירה.
const INGREDIENT_BENEFITS: Record<IngredientKey, string> = {
  // חומצות
  aha: "מקלף תאי עור מתים ומשפר זוהר וטקסטורת העור",
  bha: "חודר לעומק הנקבוביות ומסייע נגד אקנה ופוריות",
  glycolic_acid: "חומצת AHA שמקלפת בעדינות את שכבת העור העליונה ומשפרת מרקם וזוהר",
  mandelic_acid: "חומצת AHA עדינה יחסית, מתאימה גם לעור רגיש",
  lactic_acid: "חומצת AHA שמקלפת ומעניקה גם לחות, מתאימה לעור יבש או רגיש",
  tartaric_acid: "חומצת פירות שמסייעת בקילוף עדין ומייצבת נוגדי חמצון בפורמולה",
  pha: "מקלף בעדינות רבה עם פחות גירוי, מתאים לעור רגיש או פגוע במחסום",
  lha: "מקלף בעומק הנקבוביות בעדינות — אלטרנטיבה עדינה יותר ל-BHA",
  azelaic_acid: "מרגיע אדמומיות, מסייע נגד אקנה ומבהיר כתמים",
  // ויטמינים ונוגדי חמצון
  vitamin_c: "נוגד חמצון שמבהיר את גוון העור ותומך בייצור קולגן",
  vitamin_e: "נוגד חמצון שמזין ומגן על העור, לרוב משולב עם ויטמין C",
  retinol: "מסייע בחידוש תאי העור, מפחית קמטים עדינים ומשפר את מרקם העור",
  retinaldehyde: "צורת רטינואיד חזקה יותר מרטינול, מחדשת תאי עור ומשפרת מרקם",
  niacinamide: "מרגיע גירויים, מצמצם מראה נקבוביות ומחזק את מחסום העור",
  coenzyme_q10: "נוגד חמצון שתומך באנרגיית תאי העור ומסייע להפחתת קמטים עדינים",
  green_tea: "נוגד חמצון עשיר שמרגיע דלקות ומגן מפני נזקי סביבה",
  ferulic_acid: "נוגד חמצון שמייצב ויטמין C וויטמין E ומחזק את השפעתם",
  resveratrol: "נוגד חמצון חזק שמסייע בהגנה מפני נזקי קרינה וזיהום",
  // פפטידים ותומכי מבנה
  peptides: "תומך בייצור קולגן ומשפר גמישות ומרקם העור",
  collagen: "תומך במבנה ובגמישות העור, בעיקר כמרכיב לחות בשימוש חיצוני",
  elastin: "תומך בגמישות העור ומסייע לשמור על מרקם חלק",
  copper_peptides: "משפר גמישות ומרקם העור ותומך בתהליכי חידוש טבעיים",
  // לחות ומחסום עור
  hyaluronic_acid: "מספק לחות עמוקה ומעניק מראה מלא ורענן",
  glycerin: "מרכיב לחות בסיסי שמושך מים לעור ומשפר את מרקמו",
  squalane: "שמן קל שמחקה את השומן הטבעי של העור ומרכך בלי תחושת שומן",
  jojoba_oil: "שמן שדומה לשומן הטבעי של העור, מזין ומרכך בעדינות",
  ceramides: "מחזקים את מחסום העור ושומרים על לחות טבעית",
  aloe_vera: "מרגיע ומקרר, מתאים לעור מגורה או אחרי שיזוף",
  panthenol: "מרגיע, מלחלח ותומך בריפוי ובחיזוק מחסום העור",
  // הבהרה ופיגמנטציה
  hydroquinone: "מסייע בהבהרת כתמי גיל ופיגמנטציה",
  arbutin: "מבהיר כתמים ופיגמנטציה בעדינות יחסית",
  alpha_arbutin: "גרסה יציבה ויעילה יותר של ארבוטין, מבהירה פיגמנטציה",
  tranexamic_acid: "מסייע בהבהרת כתמים ומלזמה, פועל היטב לצד רכיבים אחרים",
  kojic_acid: "מבהיר כתמים על ידי עיכוב ייצור מלנין",
  licorice_root: "מרגיע ומסייע להבהיר גוון עור לא אחיד",
  // אקנה וטיפול ממוקד
  benzoyl_peroxide: "פועל נגד חיידקי אקנה ומסייע בהפחתת דלקות",
  sulfur: "מייבש ומטהר עור שמן, מסייע נגד אקנה",
  tea_tree_oil: "אנטיבקטריאלי טבעי שמסייע נגד אקנה ודלקות",
  zinc: "מרגיע דלקת ותומך באיזון ייצור השמן בעור",
  // הגנה מהשמש
  spf: "מגן מפני קרינת UV ומאט הזדקנות מוקדמת של העור",
  zinc_oxide: "מרכיב הגנה מינרלי מפני UVA/UVB, עדין לעור רגיש",
  titanium_dioxide: "מרכיב הגנה מינרלי מפני UV, יציב ועדין לעור",
};

// מילות מפתח (עברית/אנגלית/ראשי תיבות נפוצים) לזיהוי רכיב פעיל מתוך שם
// המוצר או המותג בלבד — ידע כללי על איך רכיבים נקראים בפועל על גבי
// אריזות, בלי חיפוש אינטרנט ובלי קריאה ל-API חיצוני. אותה גישה כמו
// categorizeDevice/categorizeProduct: טקסט חופשי, לא שדה סגור.
//
// aha נשאר "דלי" כללי (ראשי תיבות/"חומצת פירות" בלי לציין סוג) כדי לא
// להתנגש עם החומצות הספציפיות (גליקולית/מנדלית/לקטית/טרטרית) שמזוהות
// כל אחת בנפרד.
const INGREDIENT_KEYWORDS: Record<IngredientKey, RegExp> = {
  // חומצות
  aha: /\baha\b|חומצת פירות|אלפא הידרוקסי|alpha hydroxy/i,
  bha: /\bbha\b|סליציליק|חומצה סליצילית|salicylic/i,
  glycolic_acid: /גליקוליק|גליקולית|glycolic/i,
  mandelic_acid: /מנדלית|מנדליק|mandelic/i,
  lactic_acid: /לקטית|לקטיק|lactic/i,
  tartaric_acid: /טרטרית|טרטריק|tartaric/i,
  pha: /\bpha\b|פוליהידרוקסי|polyhydroxy/i,
  lha: /\blha\b|ליפוהידרוקסי|lipohydroxy/i,
  azelaic_acid: /אזלאי|azelaic/i,
  // ויטמינים ונוגדי חמצון
  vitamin_c: /ויטמין\s?c|ויטמין\s?סי|וי[ט]מין\s?סי|אסקורבי|vitamin\s?c|ascorbic/i,
  vitamin_e: /ויטמין\s?e|ויטמין\s?אי|טוקופרול|vitamin\s?e|tocopherol/i,
  retinol: /רטינול|retinol|retin-?a\b/i,
  retinaldehyde: /רטינאלדהיד|רטינל(?!ו)|retinaldehyde|\bretinal\b/i,
  niacinamide: /ניאצינאמיד|niacinamide/i,
  coenzyme_q10: /קואנזים\s?q ?10|\bq10\b|יוביקווינון|coenzyme\s?q ?10|ubiquinone/i,
  green_tea: /תה ירוק|green\s?tea|egcg/i,
  ferulic_acid: /פרולה|ferulic/i,
  resveratrol: /רזברטרול|resveratrol/i,
  // פפטידים ותומכי מבנה
  peptides: /פפטיד|peptide/i,
  collagen: /קולגן|collagen/i,
  elastin: /אלסטין|elastin/i,
  copper_peptides: /קופר\s?פפטיד|copper\s?peptide/i,
  // לחות ומחסום עור
  hyaluronic_acid: /היאלורוני|hyaluronic/i,
  glycerin: /גליצרין|glycerin|glycerol/i,
  squalane: /סקוואלן|squalane/i,
  jojoba_oil: /ג'וג'ובה|jojoba/i,
  ceramides: /צרמיד|ceramide/i,
  aloe_vera: /אלוורה|aloe\s?vera|\baloe\b/i,
  panthenol: /פנתנול|פאנתנול|panthenol|ויטמין\s?b5|vitamin\s?b5/i,
  // הבהרה ופיגמנטציה
  hydroquinone: /הידרוקינון|hydroquinone/i,
  arbutin: /(?<!אלפא )ארבוטין|(?<!alpha )arbutin/i,
  alpha_arbutin: /אלפא ארבוטין|alpha\s?arbutin/i,
  tranexamic_acid: /טרנקסמיק|tranexamic/i,
  kojic_acid: /קוג'יק|kojic/i,
  licorice_root: /ליקריץ|שורש שוש|licorice|liquorice/i,
  // אקנה וטיפול ממוקד
  benzoyl_peroxide: /בנזואיל|בנזוייל|benzoyl/i,
  sulfur: /גופרית|\bsulfur\b|\bsulphur\b/i,
  tea_tree_oil: /עץ התה|tea\s?tree/i,
  zinc: /(?<!תחמוצת\s)אבץ(?!\s?אוקסייד)|\bzinc\b(?!\s?oxide)/i,
  // הגנה מהשמש
  spf: /\bspf\b|הגנה מהשמש|קרם הגנה|sunscreen/i,
  zinc_oxide: /תחמוצת אבץ|זינק אוקסייד|אבץ אוקסייד|zinc\s?oxide/i,
  titanium_dioxide: /טיטניום דיוקסייד|titanium\s?dioxide/i,
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
