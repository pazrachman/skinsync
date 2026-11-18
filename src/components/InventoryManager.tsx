"use client";

import { useMemo, useState } from "react";
import { Droplet, SearchX } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import ProductBottle from "@/components/ProductBottle";
import ProductDetailModal from "@/components/ProductDetailModal";
import ProductForm from "@/components/ProductForm";
import { getExpiryInfo } from "@/lib/expiry";
import { categorizeProduct, PRODUCT_CATEGORIES } from "@/lib/productCategories";
import type { ExpiryStatus, Product } from "@/lib/types";

const STATUS_ORDER: Record<ExpiryStatus, number> = {
  expired: 0,
  soon: 1,
  unopened: 2,
  fresh: 3,
};

type Filter = "all" | "expiring" | "unopened";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "הכול" },
  { id: "expiring", label: "עומדים לפוג" },
  { id: "unopened", label: "עוד לא נפתחו" },
];

function matches(filter: Filter, status: ExpiryStatus) {
  if (filter === "expiring") return status === "soon" || status === "expired";
  if (filter === "unopened") return status === "unopened";
  return true;
}

export default function InventoryManager({
  products,
  initialEditId = null,
}: {
  products: Product[];
  /** פתיחת טופס העריכה של מוצר מסוים (למשל "עריכה" מחלון המוצר בלוח היום) */
  initialEditId?: string | null;
}) {
  const initialEdit = initialEditId ? (products.find((p) => p.id === initialEditId) ?? null) : null;
  const [formOpen, setFormOpen] = useState(initialEdit !== null);
  const [editing, setEditing] = useState<Product | null>(initialEdit);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  // הדלתות נפתחות בכל כניסה לעמוד ואז מוסרות מה-DOM.
  const [doorsGone, setDoorsGone] = useState(false);

  const selectedProduct = selectedId ? (products.find((p) => p.id === selectedId) ?? null) : null;

  const statuses = useMemo(
    () => new Map(products.map((p) => [p.id, getExpiryInfo(p).status])),
    [products]
  );

  const counts = useMemo(() => {
    let soon = 0;
    let expired = 0;
    for (const s of statuses.values()) {
      if (s === "soon") soon++;
      if (s === "expired") expired++;
    }
    return { soon, expired };
  }, [statuses]);

  // כל מוצר משתייך למדף אחד לפי קטגוריה. בלי סינון מוצגים גם מדפים ריקים,
  // כדי שהארון תמיד ייראה מאורגן.
  const shelves = useMemo(() => {
    const byCategory = new Map<string, Product[]>(PRODUCT_CATEGORIES.map((c) => [c.id, [] as Product[]]));
    for (const p of products) {
      if (matches(filter, statuses.get(p.id)!)) byCategory.get(categorizeProduct(p))!.push(p);
    }
    return PRODUCT_CATEGORIES.map((cat) => ({
      ...cat,
      products: [...(byCategory.get(cat.id) ?? [])].sort(
        (a, b) => STATUS_ORDER[statuses.get(a.id)!] - STATUS_ORDER[statuses.get(b.id)!]
      ),
    })).filter((s) => filter === "all" || s.products.length > 0);
  }, [products, filter, statuses]);

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

  const eyebrow = [
    `${products.length} מוצרים`,
    counts.soon > 0 && `${counts.soon} עומדים לפוג`,
    counts.expired > 0 && `${counts.expired} פג תוקף`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title="הארון שלי"
        actions={
          !formOpen && (
            <button type="button" onClick={openCreate} className="skn-btn skn-btn-primary">
              הוספת מוצר
            </button>
          )
        }
      />

      {formOpen && <ProductForm product={editing} onDone={closeForm} key={editing?.id ?? "new"} />}

      {products.length === 0 && !formOpen && (
        <EmptyState icon={Droplet}>
          עדיין לא הוספת מוצרים. לחצי על &ldquo;הוספת מוצר&rdquo; כדי להתחיל.
        </EmptyState>
      )}

      {products.length > 0 && !formOpen && (
        <>
          <div className="skn-filters" role="group" aria-label="סינון">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className="skn-filter"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="skn-cabinet">
            <div className="skn-cabinet-wall">
              {shelves.length === 0 && (
                <EmptyState icon={SearchX} className="bg-transparent! border-0!">
                  אין מוצרים שמתאימים לסינון הזה.
                </EmptyState>
              )}

              {shelves.map((shelf) => (
                <section key={shelf.id} aria-label={shelf.label}>
                  <p className="skn-shelf-label">{shelf.label}</p>
                  <div className="skn-shelf-scroll">
                    <div className="skn-shelf-row">
                      {shelf.products.length === 0 ? (
                        <p className="skn-shelf-empty">אין עדיין מוצרים בקטגוריה זו</p>
                      ) : (
                        shelf.products.map((p) => {
                          const status = statuses.get(p.id)!;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setSelectedId(p.id)}
                              aria-label={`${p.name} — פרטים`}
                              className="skn-bottle-btn"
                            >
                              <ProductBottle product={p} className="h-[118px] w-auto" />
                              <span className="skn-tag" aria-hidden>
                                {!p.is_device && <span className="skn-dot" data-tone={status} />}
                                <span>{p.name}</span>
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </section>
              ))}

              {!doorsGone && (
                <div className="skn-doors" aria-hidden>
                  <div className="skn-door skn-door-left">
                    <span className="skn-door-handle" />
                  </div>
                  <div
                    className="skn-door skn-door-right"
                    onAnimationEnd={() => setDoorsGone(true)}
                  >
                    <span className="skn-door-handle" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedId(null)}
        onEdit={openEdit}
      />
    </div>
  );
}
