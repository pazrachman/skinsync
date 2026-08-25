import InventoryManager from "@/components/InventoryManager";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export default async function InventoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return <InventoryManager products={(products as Product[]) ?? []} />;
}
