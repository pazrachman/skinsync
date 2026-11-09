// הודעות שגיאה אחידות ל-Server Actions ולעמודים.
// השגיאה הגולמית של Supabase נרשמת ללוג בשרת (לדיבוג), והמשתמשת מקבלת
// הודעה ברורה בעברית — בלי לחשוף פרטי טבלאות/מדיניות.

export interface ActionResult {
  error: string | null;
}

export const ERR_SIGNED_OUT = "יש להתחבר מחדש.";
export const ERR_SAVE_FAILED = "השמירה נכשלה. נסי שוב בעוד רגע.";
export const ERR_LOAD_FAILED = "לא הצלחנו לטעון את הנתונים. נסי לרענן את העמוד.";
export const ERR_NOT_FOUND = "הפריט לא נמצא או שאין לך הרשאה אליו.";
export const ERR_NETWORK = "אין חיבור לשרת. בדקי את החיבור ונסי שוב.";

interface SupabaseLikeError {
  message: string;
  code?: string;
}

export function logDbError(context: string, error: SupabaseLikeError) {
  console.error(`[skinsync] ${context}:`, error.code ?? "", error.message);
}

/** רושם את השגיאה ללוג ומחזיר ActionResult עם הודעה ידידותית. */
export function dbFailure(
  context: string,
  error: SupabaseLikeError,
  message: string = ERR_SAVE_FAILED
): ActionResult {
  logDbError(context, error);
  return { error: message };
}

export const OK: ActionResult = { error: null };
