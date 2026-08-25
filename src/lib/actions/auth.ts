"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface AuthFormState {
  error: string | null;
}

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!email || !password) {
    return { error: "יש למלא אימייל וסיסמה." };
  }
  if (password.length < 6) {
    return { error: "הסיסמה חייבת להכיל לפחות 6 תווים." };
  }

  const origin = (await headers()).get("origin");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || undefined },
      // אחרי לחיצה על קישור האימות במייל, Supabase יפנה ל-/auth/callback
      // שיעביר הלאה ל-next הזה — כדי שתופיע הודעת הצלחה בעמוד ההתחברות
      // במקום מעבר שקט לדשבורד.
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
        "/login?verified=1"
      )}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");

  // אם האימות במייל נדרש, signUp לא מייצר session מיידי.
  // הפניה ישירה ל-/dashboard תיבעט בחזרה ל-/login דרך ה-middleware בלי הסבר,
  // אז מציגים הודעה מפורשת שמבקשת לבדוק את תיבת הדואר.
  if (!data.session) {
    redirect("/login?checkEmail=1");
  }

  redirect("/dashboard");
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "יש למלא אימייל וסיסמה." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        error:
          "האימייל שלך עדיין לא אומת. בדקי את תיבת הדואר ולחצי על קישור האימות שנשלח אליך.",
      };
    }
    return { error: "אימייל או סיסמה שגויים." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
