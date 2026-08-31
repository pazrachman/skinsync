import type { Product } from "./types";

export type ProductCategoryId =
  | "cleansing"
  | "toner"
  | "serum"
  | "moisturizer"
  | "mask"
  | "spf"
  | "device"
  | "other";

export type ProductShape = "bottle" | "jar" | "device";

export interface ProductCategory {
  id: ProductCategoryId;
  label: string;
  shape: ProductShape;
}

// טקסונומיה קבועה למדפי הארון. category ב-DB היא טקסט חופשי (כדי לא
// לשנות את טופס המוצר הקיים), אז השיוך למדף נעשה כאן לפי מילות מפתח —
// כל מוצר, גם עם ניסוח חופשי בקטגוריה, מוצא לו מדף.
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: "cleansing", label: "ניקוי", shape: "bottle" },
  { id: "toner", label: "טונרים", shape: "bottle" },
  { id: "serum", label: "סרומים", shape: "bottle" },
  { id: "moisturizer", label: "קרמים ולחות", shape: "jar" },
  { id: "mask", label: "מסכות", shape: "jar" },
  { id: "spf", label: "הגנה מהשמש", shape: "bottle" },
  { id: "device", label: "מכשירים", shape: "device" },
  { id: "other", label: "אחר", shape: "bottle" },
];

export function categorizeProduct(
  product: Pick<Product, "category" | "is_device">
): ProductCategoryId {
  if (product.is_device) return "device";

  const c = (product.category ?? "").trim();
  if (!c) return "other";

  if (/ניקוי|מנק|סבון|קלנזר|cleans/i.test(c)) return "cleansing";
  if (/טונר|toner/i.test(c)) return "toner";
  if (/סרום|serum/i.test(c)) return "serum";
  if (/מסכ|mask/i.test(c)) return "mask";
  if (/spf|הגנה|sunscreen/i.test(c)) return "spf";
  if (/קרם|לחות|moistur|cream/i.test(c)) return "moisturizer";

  return "other";
}

export type DeviceKind = "led" | "roller" | "brush" | "guasha" | "generic";

// לאיזה סוג מכשיר מתאים האיור בארון — לפי איך שהמכשיר מתואר בשם המוצר,
// כי אין שדה נפרד לסוג מכשיר.
export function categorizeDevice(name: string): DeviceKind {
  const n = name.trim();
  if (/led|לד/i.test(n)) return "led";
  if (/רולר|גלגלת|roller/i.test(n)) return "roller";
  if (/מברשת|ברסה|brush/i.test(n)) return "brush";
  if (/גואה?\s?שה|gua\s?sha|גואשה/i.test(n)) return "guasha";
  return "generic";
}
