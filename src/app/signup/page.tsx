import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import AuthShell from "@/components/AuthShell";
import { signUp } from "@/lib/actions/auth";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="הרשמה"
      title="נעים להכיר"
      subtitle="כמה פרטים, ונתחיל לבנות את ארון הטיפוח שלך."
      footer={
        <>
          כבר יש לך חשבון?{" "}
          <Link
            href="/login"
            className="font-medium text-skn-pink-deep hover:underline"
          >
            התחברות
          </Link>
        </>
      }
    >
      <AuthForm mode="signup" action={signUp} />
    </AuthShell>
  );
}
