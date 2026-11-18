"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductBottle from "@/components/ProductBottle";
import ProductDetailModal from "@/components/ProductDetailModal";
import StatusChip from "@/components/StatusChip";
import { EXPIRY_STATUS_LABEL, getExpiryInfo } from "@/lib/expiry";
import type { Product } from "@/lib/types";

export default function ExpiringTiles({ products }: { products: Product[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = products.find((p) => p.id === selectedId) ?? null;

  return (
    <>
      <ul className="skn-tiles">
        {products.map((p) => {
          const info = getExpiryInfo(p);
          return (
            <li key={p.id} className="flex">
              <button
                type="button"
                className="skn-card skn-tile w-full"
                onClick={() => setSelectedId(p.id)}
                aria-label={`${p.name} — פרטים`}
              >
                <span className="skn-tile-picture">
                  <ProductBottle product={p} className="h-[80px] w-auto" />
                </span>
                <span className="skn-tile-name">{p.name}</span>
                {p.brand && <span className="skn-tile-brand">{p.brand}</span>}
                <StatusChip tone={info.status}>
                  {info.status === "expired"
                    ? `${EXPIRY_STATUS_LABEL.expired} · לפני ${Math.abs(info.daysLeft ?? 0)} ימים`
                    : `בעוד ${info.daysLeft} ימים`}
                </StatusChip>
              </button>
            </li>
          );
        })}
      </ul>

      <ProductDetailModal
        product={selected}
        onClose={() => setSelectedId(null)}
        onEdit={(p) => router.push(`/inventory?edit=${p.id}`)}
      />
    </>
  );
}
