"use client";

import { useMemo, useState } from "react";
import { Droplet } from "lucide-react";
import { deleteProduct, markProductOpened } from "@/lib/actions/products";
import EmptyState from "@/components/EmptyState";
import ExpiryBadge from "@/components/ExpiryBadge";
import IngredientTags from "@/components/IngredientTags";
import ProductForm from "@/components/ProductForm";
import { getExpiryInfo } from "@/lib/expiry";
import type { Product } from "@/lib/types";

const STATUS_ORDER: Record<string, number> = {
  expired: 0,
  soon: 1,
  unopened: 2,
  fresh: 3,
};

export default function InventoryManager({ products }: { products: Product[] }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const sorted = useMemo(
    () =>
      [...products].sort((a, b) => {
        const sa = STATUS_ORDER[getExpiryInfo(a).status];
        const sb = STATUS_ORDER[getExpiryInfo(b).status];
        return sa - sb;
      }),
    [products]
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-medium text-skn-ink">ארון הטיפוח שלי</h1>
        {!formOpen && (
          <button
            onClick={openCreate}
            className="rounded-xl bg-skn-pink-deep px-4 py-2 text-sm font-semibold text-white transition hover:brightness-90"
          >
            + הוספת מוצר
          </button>
        )}
      </div>

      {formOpen && (
        <ProductForm product={editing} onDone={closeForm} key={editing?.id ?? "new"} />
      )}

      {sorted.length === 0 && !formOpen && (
        <EmptyState icon={Droplet}>
          עדיין לא הוספת מוצרים. לחצי על &ldquo;הוספת מוצר&rdquo; כדי להתחיל.
        </EmptyState>
      )}

      <ul className="flex flex-col gap-3">
        {sorted.map((p) => (
          <li
            key={p.id}
            className="flex flex-col gap-2 rounded-2xl border border-skn-sand bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-skn-ink">{p.name}</span>
                {p.brand && <span className="text-sm text-skn-ink/40">· {p.brand}</span>}
                {p.is_device && (
                  <span className="rounded-full bg-skn-peach/10 px-2 py-0.5 text-xs font-medium text-skn-peach">
                    מכשיר
                  </span>
                )}
                <ExpiryBadge product={p} />
              </div>
              {p.category && <p className="text-sm text-skn-ink/55">{p.category}</p>}
              <IngredientTags ingredients={p.active_ingredients} />
              {p.notes && <p className="text-sm text-skn-ink/40">{p.notes}</p>}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {!p.open_date && !p.expiry_date_override && !p.is_device && (
                <form action={markProductOpened.bind(null, p.id)}>
                  <button
                    type="submit"
                    className="rounded-lg border border-skn-sage/30 bg-skn-sage/10 px-3 py-1.5 text-xs font-medium text-skn-sage hover:bg-skn-sage/20"
                  >
                    סמני כנפתח היום
                  </button>
                </form>
              )}
              <button
                onClick={() => openEdit(p)}
                className="rounded-lg border border-skn-sand px-3 py-1.5 text-xs font-medium text-skn-ink/65 hover:bg-skn-cream"
              >
                עריכה
              </button>
              <form action={deleteProduct.bind(null, p.id)}>
                <button
                  type="submit"
                  className="rounded-lg border border-skn-berry/30 px-3 py-1.5 text-xs font-medium text-skn-berry hover:bg-skn-berry/10"
                >
                  מחיקה
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
