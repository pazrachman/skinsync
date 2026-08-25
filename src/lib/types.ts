export type TimeOfDay = "morning" | "evening";

export type IngredientKey =
  | "retinol"
  | "vitamin_c"
  | "niacinamide"
  | "aha"
  | "bha"
  | "benzoyl_peroxide"
  | "spf"
  | "hyaluronic_acid"
  | "peptides"
  | "hydroquinone"
  | "azelaic_acid";

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
