import { EXPIRY_STATUS_COLOR, EXPIRY_STATUS_LABEL, getExpiryInfo } from "@/lib/expiry";
import type { Product } from "@/lib/types";

export default function ExpiryBadge({
  product,
}: {
  product: Pick<Product, "open_date" | "shelf_life_months" | "expiry_date_override">;
}) {
  const info = getExpiryInfo(product);
  const label = EXPIRY_STATUS_LABEL[info.status];
  const color = EXPIRY_STATUS_COLOR[info.status];

  const detail =
    info.status === "unopened"
      ? null
      : info.status === "expired"
      ? `לפני ${Math.abs(info.daysLeft ?? 0)} ימים`
      : `בעוד ${info.daysLeft} ימים`;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}
      title={info.expiryDate ? info.expiryDate.toLocaleDateString("he-IL") : undefined}
    >
      {label}
      {detail && <span className="opacity-70">· {detail}</span>}
    </span>
  );
}
