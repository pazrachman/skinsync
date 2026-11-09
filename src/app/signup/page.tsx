import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import AuthShell from "@/components/AuthShell";
import { signUp } from "@/lib/actions/auth";

export default function SignupPage() {
  return (
    <AuthShell
      footer={
        <>
          כבר יש לך חשבון? <Link href="/login">כניסה</Link>
        </>
      }
    >
      <AuthForm mode="signup" action={signUp} />
    </AuthShell>
  );
}
