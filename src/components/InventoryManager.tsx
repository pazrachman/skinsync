"use client";

import { useMemo, useState } from "react";
import { deleteProduct, markProductOpened } from "@/lib/actions/products";
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
        <h1 className="text-xl font-bold text-slate-900">ארון הטיפוח שלי</h1>
        {!formOpen && (
          <button
            onClick={openCreate}
            className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
          >
            + הוספת מוצר
          </button>
        )}
      </div>

      {formOpen && (
        <ProductForm product={editing} onDone={closeForm} key={editing?.id ?? "new"} />
      )}

      {sorted.length === 0 && !formOpen && (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          עדיין לא הוספת מוצרים. לחצי על &ldquo;הוספת מוצר&rdquo; כדי להתחיל.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {sorted.map((p) => (
          <li
            key={p.id}
            className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900">{p.name}</span>
                {p.brand && <span className="text-sm text-slate-400">· {p.brand}</span>}
                {p.is_device && (
                  <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                    מכשיר
                  </span>
                )}
                <ExpiryBadge product={p} />
              </div>
              {p.category && <p className="text-sm text-slate-500">{p.category}</p>}
              <IngredientTags ingredients={p.active_ingredients} />
              {p.notes && <p className="text-sm text-slate-400">{p.notes}</p>}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {!p.open_date && !p.expiry_date_override && !p.is_device && (
                <form action={markProductOpened.bind(null, p.id)}>
                  <button
                    type="submit"
                    className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                  >
                    סמני כנפתח היום
                  </button>
                </form>
              )}
              <button
                onClick={() => openEdit(p)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                עריכה
              </button>
              <form action={deleteProduct.bind(null, p.id)}>
                <button
                  type="submit"
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50"
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
