import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { signUp } from "@/lib/actions/auth";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 to-white px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">SkinSync</h1>
        <p className="mb-6 text-sm text-slate-500">
          יצירת אזור אישי חדש — ניהול שגרת הטיפוח שלך במקום אחד
        </p>
        <AuthForm mode="signup" action={signUp} />
        <p className="mt-6 text-center text-sm text-slate-500">
          כבר יש לך חשבון?{" "}
          <Link href="/login" className="font-medium text-rose-600 hover:underline">
            התחברות
          </Link>
        </p>
      </div>
    </main>
  );
}
