export type TimeOfDay = "morning" | "evening";

export type IngredientKey =
  // חומצות
  | "aha"
  | "bha"
  | "glycolic_acid"
  | "mandelic_acid"
  | "lactic_acid"
  | "tartaric_acid"
  | "pha"
  | "lha"
  | "azelaic_acid"
  // ויטמינים ונוגדי חמצון
  | "vitamin_c"
  | "vitamin_e"
  | "retinol"
  | "retinaldehyde"
  | "niacinamide"
  | "coenzyme_q10"
  | "green_tea"
  | "ferulic_acid"
  | "resveratrol"
  // פפטידים ותומכי מבנה
  | "peptides"
  | "collagen"
  | "elastin"
  | "copper_peptides"
  // לחות ומחסום עור
  | "hyaluronic_acid"
  | "glycerin"
  | "squalane"
  | "jojoba_oil"
  | "ceramides"
  | "aloe_vera"
  | "panthenol"
  // הבהרה ופיגמנטציה
  | "hydroquinone"
  | "arbutin"
  | "alpha_arbutin"
  | "tranexamic_acid"
  | "kojic_acid"
  | "licorice_root"
  // אקנה וטיפול ממוקד
  | "benzoyl_peroxide"
  | "sulfur"
  | "tea_tree_oil"
  | "zinc"
  // הגנה מהשמש
  | "spf"
  | "zinc_oxide"
  | "titanium_dioxide";

export interface Product {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  category: string | null;
  active_ingredients: IngredientKey[];
  open_date: string | null; // ISO date
  shelf_life_months: number;
  expiry_date_override: string | null; // ISO date
  is_device: boolean;
  notes: string | null;
  skin_benefits: string | null;
  avoid_mixing_with: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduleItem {
  id: string;
  user_id: string;
  product_id: string | null;
  days_of_week: number[]; // 0=Sunday ... 6=Saturday
  time_of_day: TimeOfDay;
  sort_order: number;
  created_at: string;
  product?: Product | null;
}

export interface ScheduleCompletion {
  id: string;
  user_id: string;
  schedule_item_id: string;
  completed_on: string; // ISO date
  created_at: string;
}

export interface MaintenanceReminder {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  cadence_days: number;
  last_done_on: string | null;
  created_at: string;
}

export type ExpiryStatus = "unopened" | "fresh" | "soon" | "expired";
