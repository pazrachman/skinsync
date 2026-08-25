"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { IngredientKey } from "@/lib/types";

export interface ProductFormState {
  error: string | null;
}

function parseIngredients(formData: FormData): IngredientKey[] {
  return formData.getAll("active_ingredients").map((v) => String(v)) as IngredientKey[];
}

export async function upsertProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "יש להתחבר מחדש." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const openDate = String(formData.get("open_date") ?? "").trim();
  const shelfLifeMonths = Number(formData.get("shelf_life_months") ?? 6);
  const expiryOverride = String(formData.get("expiry_date_override") ?? "").trim();
  const isDevice = formData.get("is_device") === "on";
  const notes = String(formData.get("notes") ?? "").trim();
  const activeIngredients = parseIngredients(formData);

  if (!name) {
    return { error: "יש להזין שם מוצר." };
  }
  if (!Number.isFinite(shelfLifeMonths) || shelfLifeMonths <= 0) {
    return { error: "תוקף לאחר פתיחה חייב להיות מספר חודשים חיובי." };
  }

  const payload = {
    user_id: user.id,
    name,
    brand: brand || null,
    category: category || null,
    active_ingredients: activeIngredients,
    open_date: openDate || null,
    shelf_life_months: shelfLifeMonths,
    expiry_date_override: expiryOverride || null,
    is_device: isDevice,
    notes: notes || null,
  };

  const { error } = id
    ? await supabase.from("products").update(payload).eq("id", id).eq("user_id", user.id)
    : await supabase.from("products").insert(payload);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/schedule");
  return { error: null };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("products").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/schedule");
}

export async function markProductOpened(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const today = new Date().toISOString().slice(0, 10);
  await supabase
    .from("products")
    .update({ open_date: today })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}
