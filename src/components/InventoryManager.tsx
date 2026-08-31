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
        // "ארון" — דופן עץ עם עומק אמיתי, מדף לכל קטגוריה, ודלתות שנפתחות
        // בטעינה ומגלות את מה שבפנים.
        <div
          key={products.length}
          className="skn-wood-panel relative overflow-hidden rounded-[2rem] border border-skn-sand p-3 sm:p-5"
          style={{ perspective: "1200px" }}
        >
          <div className="flex flex-col gap-3">
            {shelves.map((shelf, i) => (
              <div
                key={shelf.id}
                className="skn-animate-fade-up"
                style={{ animationDelay: `${Math.min(i, 8) * 90}ms` }}
              >
                {/* רצועת LED מעל המדף */}
                <div
                  aria-hidden
                  className="mx-6 h-3 rounded-full bg-gradient-to-b from-skn-peach/25 to-transparent blur-md"
                />

                {/* התא של הקטגוריה */}
                <div className="rounded-2xl border border-skn-sand/70 bg-white/65 p-2.5 backdrop-blur-[1px]">
                  {shelf.products.length === 0 ? (
                    <div className="flex flex-col items-center gap-1 py-1.5 opacity-40">
                      <div className="flex items-end gap-3">
                        <div className="h-10 w-6 rounded-xl border border-dashed border-skn-ink/30" />
                        <div className="h-7 w-6 rounded-xl border border-dashed border-skn-ink/30" />
                      </div>
                      <p className="text-xs text-skn-ink/60">אין עדיין מוצרים בקטגוריה זו</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-end justify-center gap-x-4 gap-y-2">
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
                <p className="mt-1 text-center font-mono text-[10px] tracking-wide text-skn-ink/40">
                  {shelf.label}
                </p>

                {/* המדף עצמו — קרש עץ עם קצה בהיר למעלה */}
                <div
                  aria-hidden
                  className="mx-2 mt-0.5 h-2.5 rounded-b-xl border-t border-white/40 bg-gradient-to-b from-[#c9a874] to-[#a8824f] shadow-[0_5px_7px_rgba(58,44,36,0.28)]"
                />
              </div>
            ))}
          </div>

          {/* דלת שמאל */}
          <div
            aria-hidden
            className="skn-cabinet-door-left skn-wood-panel pointer-events-none absolute inset-y-0 left-0 z-10 w-1/2 border-l-2 border-skn-sand"
          >
            <div className="m-3 h-[calc(100%-1.5rem)] rounded-md border border-skn-ink/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25),inset_0_3px_10px_rgba(58,44,36,0.2)]" />
            {/* ידית מתכת עם שני ברגי הרכבה */}
            <div className="absolute right-4 top-40 flex flex-col items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded-full bg-skn-ink/60 shadow-sm" />
              <span className="h-28 w-5 rounded-full bg-gradient-to-l from-skn-ink/35 via-skn-ink/85 to-skn-ink/35 shadow-md" />
              <span className="h-3.5 w-3.5 rounded-full bg-skn-ink/60 shadow-sm" />
            </div>
          </div>

          {/* דלת ימין */}
          <div
            aria-hidden
            className="skn-cabinet-door-right skn-wood-panel pointer-events-none absolute inset-y-0 right-0 z-10 w-1/2 border-r-2 border-skn-sand"
          >
            <div className="m-3 h-[calc(100%-1.5rem)] rounded-md border border-skn-ink/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25),inset_0_3px_10px_rgba(58,44,36,0.2)]" />
            <div className="absolute left-4 top-40 flex flex-col items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded-full bg-skn-ink/60 shadow-sm" />
              <span className="h-28 w-5 rounded-full bg-gradient-to-l from-skn-ink/35 via-skn-ink/85 to-skn-ink/35 shadow-md" />
              <span className="h-3.5 w-3.5 rounded-full bg-skn-ink/60 shadow-sm" />
            </div>
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
