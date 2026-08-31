"use client";

import { useMemo, useState } from "react";
import { Droplet } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import ProductBottle from "@/components/ProductBottle";
import ProductDetailModal from "@/components/ProductDetailModal";
import ProductForm from "@/components/ProductForm";
import { getExpiryInfo } from "@/lib/expiry";
import { categorizeProduct, PRODUCT_CATEGORIES } from "@/lib/productCategories";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedProduct = selectedId
    ? (products.find((p) => p.id === selectedId) ?? null)
    : null;

  // כל מוצר משתייך למדף אחד לפי קטגוריה — כולל מדפים ריקים, כדי שהארון
  // תמיד יראה מאורגן ולא יחסר ממנו חלק.
  const shelves = useMemo(() => {
    const byCategory = new Map<string, Product[]>(
      PRODUCT_CATEGORIES.map((c) => [c.id, [] as Product[]])
    );
    for (const p of products) {
      byCategory.get(categorizeProduct(p))!.push(p);
    }
    return PRODUCT_CATEGORIES.map((cat) => ({
      ...cat,
      products: [...(byCategory.get(cat.id) ?? [])].sort(
        (a, b) => STATUS_ORDER[getExpiryInfo(a).status] - STATUS_ORDER[getExpiryInfo(b).status]
      ),
    }));
  }, [products]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(p: Product) {
    setSelectedId(null);
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

      {products.length === 0 && !formOpen && (
        <EmptyState icon={Droplet}>
          עדיין לא הוספת מוצרים. לחצי על &ldquo;הוספת מוצר&rdquo; כדי להתחיל.
        </EmptyState>
      )}

      {products.length > 0 && !formOpen && (
        // "ארון" פתוח — דופן עץ אמיתית מאחורה, ומדף לכל קטגוריה.
        <div className="skn-wood-panel rounded-[2rem] border border-skn-sand p-4 shadow-[inset_0_3px_14px_rgba(58,44,36,0.18)] sm:p-8">
          <div className="flex flex-col gap-9">
            {shelves.map((shelf, i) => (
              <div
                key={shelf.id}
                className="skn-animate-fade-up"
                style={{ animationDelay: `${Math.min(i, 8) * 90}ms` }}
              >
                {/* רצועת LED מעל המדף */}
                <div
                  aria-hidden
                  className="mx-6 h-5 rounded-full bg-gradient-to-b from-skn-peach/25 to-transparent blur-md"
                />

                {/* התא של הקטגוריה */}
                <div className="rounded-2xl border border-skn-sand/70 bg-white/65 p-4 backdrop-blur-[1px]">
                  {shelf.products.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-3 opacity-40">
                      <div className="flex items-end gap-3">
                        <div className="h-14 w-8 rounded-xl border border-dashed border-skn-ink/30" />
                        <div className="h-10 w-8 rounded-xl border border-dashed border-skn-ink/30" />
                      </div>
                      <p className="text-xs text-skn-ink/60">אין עדיין מוצרים בקטגוריה זו</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-end justify-center gap-x-6 gap-y-4">
                      {shelf.products.map((p) => {
                        const status = getExpiryInfo(p).status;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedId(p.id)}
                            aria-label={`${p.name} — פרטים`}
                            className="rounded-2xl transition hover:-translate-y-1 hover:drop-shadow-[0_10px_14px_rgba(58,44,36,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skn-pink/40"
                          >
                            <ProductBottle name={p.name} status={status} shape={shelf.shape} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* תווית המדף */}
                <p className="mt-1.5 text-center font-mono text-[11px] tracking-wide text-skn-ink/40">
                  {shelf.label}
                </p>

                {/* המדף עצמו — קרש עץ עם קצה בהיר למעלה */}
                <div
                  aria-hidden
                  className="mx-2 mt-1 h-3.5 rounded-b-xl border-t border-white/40 bg-gradient-to-b from-[#c9a874] to-[#a8824f] shadow-[0_5px_7px_rgba(58,44,36,0.28)]"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedId(null)}
        onEdit={openEdit}
      />
    </div>
  );
}
