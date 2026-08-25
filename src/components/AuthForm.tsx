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
    <form action={formAction} className="flex flex-col gap-5">
      {mode === "signup" && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="displayName"
            className="text-sm font-medium text-skn-ink/70"
          >
            שם תצוגה
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="name"
            placeholder="לדוגמה: נועה"
            className="rounded-xl border border-skn-mist bg-white px-3.5 py-2.5 text-sm text-skn-ink placeholder:text-skn-ink/35 transition focus:border-skn-amber focus:outline-none focus:ring-2 focus:ring-skn-amber/20"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-skn-ink/70">
          אימייל
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="rounded-xl border border-skn-mist bg-white px-3.5 py-2.5 text-sm text-skn-ink placeholder:text-skn-ink/35 transition focus:border-skn-amber focus:outline-none focus:ring-2 focus:ring-skn-amber/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-skn-ink/70"
        >
          סיסמה
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="לפחות 6 תווים"
          className="rounded-xl border border-skn-mist bg-white px-3.5 py-2.5 text-sm text-skn-ink placeholder:text-skn-ink/35 transition focus:border-skn-amber focus:outline-none focus:ring-2 focus:ring-skn-amber/20"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-skn-wine/10 px-3.5 py-2.5 text-sm text-skn-wine">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-xl bg-skn-ink px-4 py-2.5 text-sm font-semibold text-skn-paper transition hover:bg-skn-amber disabled:opacity-60"
      >
        {pending
          ? "רגע אחד..."
          : mode === "login"
          ? "התחברות"
          : "יצירת חשבון"}
      </button>
    </form>
  );
}
