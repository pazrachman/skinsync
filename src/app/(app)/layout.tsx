import { redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="skn-app">
      <TopBar
        displayName={(user.user_metadata?.display_name as string | undefined) ?? null}
        email={user.email ?? null}
      />
      <main className="skn-main">{children}</main>
    </div>
  );
}
