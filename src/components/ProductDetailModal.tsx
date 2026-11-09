"use client";

import { useEffect, useState, useTransition } from "react";
import { CircleCheck, TriangleAlert, X } from "lucide-react";
import { deleteProduct, markProductOpened } from "@/lib/actions/products";
import ExpiryBadge from "@/components/ExpiryBadge";
import InlineError from "@/components/InlineError";
import IngredientTags from "@/components/IngredientTags";
import ProductBottle from "@/components/ProductBottle";
import { ERR_NETWORK, type ActionResult } from "@/lib/errors";
import { getExpiryInfo } from "@/lib/expiry";
import { categorizeProduct, PRODUCT_CATEGORIES } from "@/lib/productCategories";
import type { Product } from "@/lib/types";

export default function ProductDetailModal({
  product,
  onClose,
  onEdit,
}: {
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
}) {
  // השגיאה שמורה יחד עם מזהה המוצר, כדי שלא "תדלוף" למוצר אחר שנפתח אחר כך
  const [actionError, setActionError] = useState<{ productId: string; message: string } | null>(
    null
  );
  const [pending, startTransition] = useTransition();

  function run(productId: string, action: () => Promise<ActionResult>, onSuccess?: () => void) {
    setActionError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.error) setActionError({ productId, message: result.error });
        else onSuccess?.();
      } catch {
        setActionError({ productId, message: ERR_NETWORK });
      }
    });
  }

  useEffect(() => {
    if (!product) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [product, onClose]);

  if (!product) return null;

  const status = getExpiryInfo(product).status;
  const categoryId = categorizeProduct(product);
  const categoryLabel = PRODUCT_CATEGORIES.find((c) => c.id === categoryId)?.label;
  const shape = PRODUCT_CATEGORIES.find((c) => c.id === categoryId)?.shape ?? "bottle";

  return (
    <div
      className="skn-animate-fade-up fixed inset-0 z-50 flex items-center justify-center bg-skn-ink/40 p-4 backdrop-blur-sm"
      style={{ animationDuration: "0.2s" }}
      onClick={onClose}
    >
      <div
        className="skn-animate-modal-in relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="סגירה"
          className="absolute left-4 top-4 rounded-full p-1.5 text-skn-ink/40 transition hover:bg-skn-cream hover:text-skn-ink"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <ProductBottle name={product.name} status={status} shape={shape} />

          <div>
            <h2 className="font-display text-xl font-medium text-skn-ink">{product.name}</h2>
            {product.brand && <p className="text-sm text-skn-ink/50">{product.brand}</p>}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {categoryLabel && (
              <span className="rounded-full bg-skn-cream px-2.5 py-0.5 text-xs font-medium text-skn-ink/60">
                {categoryLabel}
              </span>
            )}
            {product.is_device && (
              <span className="rounded-full bg-skn-peach/10 px-2.5 py-0.5 text-xs font-medium text-skn-peach">
                מכשיר
              </span>
            )}
            <ExpiryBadge product={product} />
          </div>

          <IngredientTags ingredients={product.active_ingredients} />

          {product.skin_benefits && (
            <div className="w-full rounded-xl border border-skn-sage/25 bg-skn-sage/10 p-3 text-right">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-skn-sage">
                <CircleCheck className="h-4 w-4 shrink-0" />
                יתרונות לעור
              </div>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-skn-ink/70">
                {product.skin_benefits}
              </p>
            </div>
          )}

          <div className="w-full rounded-xl border border-skn-berry/25 bg-skn-berry/10 p-3 text-right">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-skn-berry">
              <TriangleAlert className="h-4 w-4 shrink-0" />
              לא לערבב עם
            </div>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-skn-ink/70">
              {product.avoid_mixing_with?.trim() || "לא ידוע על התנגשות עם מוצר אחר"}
            </p>
          </div>

          {product.notes && (
            <p className="text-sm leading-relaxed text-skn-ink/55">{product.notes}</p>
          )}

          {product.open_date && (
            <p className="font-mono text-[11px] text-skn-ink/35">
              נפתח ב-{new Date(product.open_date).toLocaleDateString("he-IL")}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <InlineError
            message={actionError?.productId === product.id ? actionError.message : null}
            onDismiss={() => setActionError(null)}
          />
          {!product.open_date && !product.expiry_date_override && !product.is_device && (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(product.id, () => markProductOpened(product.id))}
              className="w-full rounded-lg border border-skn-sage/30 bg-skn-sage/10 px-3 py-2 text-sm font-medium text-skn-sage hover:bg-skn-sage/20 disabled:opacity-60"
            >
              סמני כנפתח היום
            </button>
          )}
          <button
            onClick={() => onEdit(product)}
            className="w-full rounded-lg border border-skn-sand px-3 py-2 text-sm font-medium text-skn-ink/65 hover:bg-skn-cream"
          >
            עריכה
          </button>
          <button
            type="button"
            disabled={pending}
            // סוגרים את החלון רק אחרי שהמחיקה באמת הצליחה
            onClick={() => run(product.id, () => deleteProduct(product.id), onClose)}
            className="w-full rounded-lg border border-skn-berry/30 px-3 py-2 text-sm font-medium text-skn-berry hover:bg-skn-berry/10 disabled:opacity-60"
          >
            מחיקה
          </button>
        </div>
      </div>
    </div>
  );
}
