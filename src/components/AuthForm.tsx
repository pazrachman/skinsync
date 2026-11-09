"use client";

import { useActionState } from "react";
import type { AuthFormState } from "@/lib/actions/auth";

interface AuthFormProps {
  mode: "login" | "signup";
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
}

const initialState: AuthFormState = { error: null };

export default function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="skn-auth-fields">
      {mode === "signup" && (
        <div className="skn-auth-field">
          <label htmlFor="displayName" className="skn-auth-label">
            שם תצוגה
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="name"
            placeholder="לדוגמה: נועה"
            className="skn-auth-input"
          />
        </div>
      )}

      <div className="skn-auth-field">
        <label htmlFor="email" className="skn-auth-label">
          אימייל
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="paz@example.com"
          className="skn-auth-input"
        />
      </div>

      <div className="skn-auth-field">
        <label htmlFor="password" className="skn-auth-label">
          סיסמה
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder={mode === "signup" ? "לפחות 6 תווים" : undefined}
          className="skn-auth-input"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-skn-berry/10 px-3.5 py-2.5 text-sm text-skn-berry">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="skn-auth-button">
        {pending ? "רגע אחד..." : mode === "login" ? "כניסה" : "הרשמה"}
      </button>
    </form>
  );
}
