import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { signIn } from "@/lib/actions/auth";

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const verified = params.verified === "1";
  const checkEmail = params.checkEmail === "1";
  const callbackFailed = params.error === "auth_callback_failed";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 to-white px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">SkinSync</h1>
        <p className="mb-6 text-sm text-slate-500">
          התחברות לאזור האישי שלך
        </p>

        {verified && (
          <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            האימייל אומת בהצלחה! אפשר להתחבר עכשיו.
          </p>
        )}

        {checkEmail && (
          <p className="mb-4 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-700">
            נרשמת בהצלחה! שלחנו אליך אימייל לאישור החשבון — לחצי על הקישור
            שבו כדי להתחבר.
          </p>
        )}

        {callbackFailed && (
          <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            אימות הקישור נכשל או שפג תוקפו. אפשר לנסות להתחבר, או להירשם
            מחדש כדי לקבל קישור חדש.
          </p>
        )}

        <AuthForm mode="login" action={signIn} />
        <p className="mt-6 text-center text-sm text-slate-500">
          עדיין אין לך חשבון?{" "}
          <Link href="/signup" className="font-medium text-rose-600 hover:underline">
            הרשמה
          </Link>
        </p>
      </div>
    </main>
  );
}
