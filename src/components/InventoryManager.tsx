"use client";

import { useMemo, useState } from "react";
import { Droplet } from "lucide-react";
import { deleteProduct, markProductOpened } from "@/lib/actions/products";
import EmptyState from "@/components/EmptyState";
import ExpiryBadge from "@/components/ExpiryBadge";
import IngredientTags from "@/components/IngredientTags";
import MiniBottleIcon from "@/components/MiniBottleIcon";
import ProductForm from "@/components/ProductForm";
import { getExpiryInfo } from "@/lib/expiry";
import type { ExpiryStatus, Product } from "@/lib/types";

const STATUS_ORDER: Record<string, number> = {
  expired: 0,
  soon: 1,
  unopened: 2,
  fresh: 3,
};

// צבע הזכוכית של הבקבוקון על המדף נושא את אותה משמעות כמו תג התפוגה.
const STATUS_BOTTLE_FILL: Record<ExpiryStatus, string> = {
  fresh: "fill-skn-sage/50",
  soon: "fill-skn-honey/50",
  expired: "fill-skn-berry/50",
  unopened: "fill-skn-sand",
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

      {sorted.length > 0 && (
        // "ארון" — רקע חם שמדמה את פנים הארון, וכל מוצר יושב על מדף משלו.
        <div className="rounded-[1.75rem] border border-skn-sand bg-gradient-to-b from-skn-cream-deep to-skn-cream p-3 shadow-[inset_0_2px_8px_rgba(58,44,36,0.08)] sm:p-5">
          <ul className="flex flex-col gap-5">
            {sorted.map((p, i) => {
              const status = getExpiryInfo(p).status;
              return (
                <li
                  key={p.id}
                  className="skn-animate-settle"
                  style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                >
                  <div className="flex flex-col gap-2 rounded-2xl border border-skn-sand bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <MiniBottleIcon
                          fillClassName={STATUS_BOTTLE_FILL[status]}
                          className="h-6 w-auto shrink-0"
                        />
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
                  </div>
                  {/* המדף שעליו יושב הבקבוקון */}
                  <div
                    aria-hidden
                    className="mx-3 h-2 rounded-b-xl bg-gradient-to-b from-skn-sand to-skn-sand/30 shadow-[0_3px_4px_rgba(58,44,36,0.15)]"
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
