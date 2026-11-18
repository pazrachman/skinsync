"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { deleteProduct, markProductOpened } from "@/lib/actions/products";
import InlineError from "@/components/InlineError";
import IngredientTags from "@/components/IngredientTags";
import ProductBottle from "@/components/ProductBottle";
import StatusChip from "@/components/StatusChip";
import { ERR_NETWORK, type ActionResult } from "@/lib/errors";
import { EXPIRY_STATUS_LABEL, getExpiryInfo } from "@/lib/expiry";
import { categorizeProduct, PRODUCT_CATEGORIES } from "@/lib/productCategories";
import type { Product } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL");
}

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
  const [closing, setClosing] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // סגירה עם אנימציית יציאה קצרה (150ms); onClose נקרא כשהיא מסתיימת.
  const requestClose = useCallback(() => setClosing(true), []);

  function finishClose() {
    setClosing(false);
    onClose();
    returnFocusRef.current?.focus?.();
  }

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

    returnFocusRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [product, requestClose]);

  if (!product) return null;

  const info = getExpiryInfo(product);
  const category = PRODUCT_CATEGORIES.find((c) => c.id === categorizeProduct(product));
  const titleId = `product-${product.id}-title`;

  const left =
    info.status === "unopened"
      ? "—"
      : info.status === "expired"
        ? `פג לפני ${Math.abs(info.daysLeft ?? 0)} ימים`
        : `${info.daysLeft} ימים`;

  return (
    <div
      className="skn-modal-overlay"
      data-closing={closing || undefined}
      onClick={requestClose}
      onAnimationEnd={(e) => {
        if (closing && e.target === e.currentTarget) finishClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="skn-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={requestClose} aria-label="סגירה" className="skn-modal-close">
          <X className="h-4 w-4" />
        </button>

        <div className="skn-modal-grid">
          <div className="skn-modal-picture">
            <ProductBottle product={product} className="h-[150px] w-auto" />
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <div>
              <h2 id={titleId} className="skn-modal-title">
                {product.name}
              </h2>
              {(product.brand || category) && (
                <p className="mt-1 text-[0.9375rem] text-skn-muted">
                  {[product.brand, category?.label].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {!product.is_device && (
                <StatusChip tone={info.status}>{EXPIRY_STATUS_LABEL[info.status]}</StatusChip>
              )}
              {product.is_device && <StatusChip tone="unopened">מכשיר</StatusChip>}
            </div>

            {!product.is_device && (
              <dl className="skn-facts">
                <dt>נפתח</dt>
                <dd>{product.open_date ? formatDate(product.open_date) : "עוד לא נפתח"}</dd>
                <dt>תוקף מהפתיחה</dt>
                <dd>{product.shelf_life_months} חודשים</dd>
                {product.expiry_date_override && (
                  <>
                    <dt>תאריך תפוגה</dt>
                    <dd>{formatDate(product.expiry_date_override)}</dd>
                  </>
                )}
                <dt>נשאר</dt>
                <dd>{left}</dd>
              </dl>
            )}

            <IngredientTags ingredients={product.active_ingredients} />

            {product.skin_benefits && (
              <div className="skn-note-box bg-skn-sage-soft">
                <p className="font-semibold text-skn-sage">יתרונות לעור</p>
                <p className="mt-0.5 whitespace-pre-line text-skn-ink">{product.skin_benefits}</p>
              </div>
            )}

            <div className="skn-note-box bg-skn-berry-soft">
              <p className="font-semibold text-skn-berry">לא לערבב עם</p>
              <p className="mt-0.5 whitespace-pre-line text-skn-ink">
                {product.avoid_mixing_with?.trim() || "לא ידוע על התנגשות עם מוצר אחר"}
              </p>
            </div>

            {product.notes && <p className="text-sm leading-relaxed text-skn-muted">{product.notes}</p>}
          </div>
        </div>

        <div className="mt-5">
          <InlineError
            message={actionError?.productId === product.id ? actionError.message : null}
            onDismiss={() => setActionError(null)}
          />
        </div>

        <div className="skn-modal-actions">
          {!product.open_date && !product.expiry_date_override && !product.is_device && (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(product.id, () => markProductOpened(product.id))}
              className="skn-btn skn-btn-primary"
            >
              סימון כנפתח היום
            </button>
          )}
          <button type="button" onClick={() => onEdit(product)} className="skn-btn skn-btn-secondary">
            עריכה
          </button>
          <button
            type="button"
            disabled={pending}
            // סוגרים את החלון רק אחרי שהמחיקה באמת הצליחה
            onClick={() => run(product.id, () => deleteProduct(product.id), onClose)}
            className="skn-btn skn-btn-quiet"
          >
            מחיקה
          </button>
        </div>
      </div>
    </div>
  );
}
