import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import AuthShell from "@/components/AuthShell";
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
    <AuthShell
      eyebrow="כניסה לחשבון"
      title="ברוכה השבה"
      subtitle="התחברי כדי להמשיך את השגרה בדיוק מאיפה שעצרת."
      footer={
        <>
          עדיין אין לך חשבון?{" "}
          <Link
            href="/signup"
            className="font-medium text-skn-amber hover:underline"
          >
            הרשמה
          </Link>
        </>
      }
    >
      {verified && (
        <p className="mb-4 rounded-xl bg-skn-sage/10 px-3.5 py-2.5 text-sm text-skn-sage">
          האימייל אומת בהצלחה! אפשר להתחבר עכשיו.
        </p>
      )}

      {checkEmail && (
        <p className="mb-4 rounded-xl bg-skn-amber/10 px-3.5 py-2.5 text-sm text-skn-amber">
          נרשמת בהצלחה! שלחנו אליך אימייל לאישור החשבון — לחצי על הקישור
          שבו כדי להתחבר.
        </p>
      )}

      {callbackFailed && (
        <p className="mb-4 rounded-xl bg-skn-wine/10 px-3.5 py-2.5 text-sm text-skn-wine">
          אימות הקישור נכשל או שפג תוקפו. אפשר לנסות להתחבר, או להירשם
          מחדש כדי לקבל קישור חדש.
        </p>
      )}

      <AuthForm mode="login" action={signIn} />
    </AuthShell>
  );
}
