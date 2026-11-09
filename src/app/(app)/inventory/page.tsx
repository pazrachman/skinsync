import ErrorState from "@/components/ErrorState";
import InventoryManager from "@/components/InventoryManager";
import { logDbError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export default async function InventoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  if (error) {
    logDbError("InventoryManager: load", error);
    return <ErrorState title="לא הצלחנו לטעון את ארון הטיפוח" />;
  }

  return <InventoryManager products={(products ?? []) as Product[]} />;
}
