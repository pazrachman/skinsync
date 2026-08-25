"use client";

import { useActionState, useEffect } from "react";
import { upsertProduct, type ProductFormState } from "@/lib/actions/products";
import { ALL_INGREDIENTS, INGREDIENT_LABELS } from "@/lib/ingredients";
import type { Product } from "@/lib/types";

const initialState: ProductFormState = { error: null };

export default function ProductForm({
  product,
  onDone,
}: {
  product?: Product | null;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(upsertProduct, initialState);

  // כשההגשה הצליחה (אין שגיאה ואין יותר pending) — סוגרים את הטופס
  const succeeded = !pending && state.error === null && state !== initialState;
  useEffect(() => {
    if (succeeded) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [succeeded]);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl border border-skn-sand bg-white p-5 shadow-sm"
    >
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-skn-ink/70">שם המוצר *</label>
          <input
            name="name"
            required
            defaultValue={product?.name ?? ""}
            placeholder="לדוגמה: סרום ויטמין C"
            className="rounded-lg border border-skn-sand px-3 py-2 text-sm text-skn-ink focus:border-skn-pink focus:outline-none focus:ring-2 focus:ring-skn-pink/20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-skn-ink/70">מותג</label>
          <input
            name="brand"
            defaultValue={product?.brand ?? ""}
            className="rounded-lg border border-skn-sand px-3 py-2 text-sm text-skn-ink focus:border-skn-pink focus:outline-none focus:ring-2 focus:ring-skn-pink/20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-skn-ink/70">קטגוריה</label>
          <input
            name="category"
            defaultValue={product?.category ?? ""}
            placeholder="סרום / קרם / מסכה / מכשיר..."
            className="rounded-lg border border-skn-sand px-3 py-2 text-sm text-skn-ink focus:border-skn-pink focus:outline-none focus:ring-2 focus:ring-skn-pink/20"
          />
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            id="is_device"
            name="is_device"
            type="checkbox"
            defaultChecked={product?.is_device ?? false}
            className="h-4 w-4 rounded border-skn-sand text-skn-pink-deep focus:ring-skn-pink/40"
          />
          <label htmlFor="is_device" className="text-sm text-skn-ink/70">
            זהו מכשיר (לא מוצר מתכלה, למשל מסכת LED)
          </label>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-skn-ink/70">תאריך פתיחה</label>
          <input
            name="open_date"
            type="date"
            defaultValue={product?.open_date ?? ""}
            className="rounded-lg border border-skn-sand px-3 py-2 text-sm text-skn-ink focus:border-skn-pink focus:outline-none focus:ring-2 focus:ring-skn-pink/20"
          />
          <p className="text-xs text-skn-ink/40">השאירי ריק אם עדיין לא נפתח</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-skn-ink/70">
            תוקף לאחר פתיחה (בחודשים)
          </label>
          <input
            name="shelf_life_months"
            type="number"
            min={1}
            max={60}
            defaultValue={product?.shelf_life_months ?? 6}
            className="rounded-lg border border-skn-sand px-3 py-2 text-sm text-skn-ink focus:border-skn-pink focus:outline-none focus:ring-2 focus:ring-skn-pink/20"
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium text-skn-ink/70">
            תאריך תפוגה קבוע (אופציונלי — גובר על החישוב האוטומטי)
          </label>
          <input
            name="expiry_date_override"
            type="date"
            defaultValue={product?.expiry_date_override ?? ""}
            className="w-full rounded-lg border border-skn-sand px-3 py-2 text-sm text-skn-ink focus:border-skn-pink focus:outline-none focus:ring-2 focus:ring-skn-pink/20 sm:w-1/2"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-skn-ink/70">רכיבים פעילים</label>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {ALL_INGREDIENTS.map((ing) => (
            <label key={ing} className="flex items-center gap-1.5 text-sm text-skn-ink/65">
              <input
                type="checkbox"
                name="active_ingredients"
                value={ing}
                defaultChecked={product?.active_ingredients?.includes(ing) ?? false}
                className="h-4 w-4 rounded border-skn-sand text-skn-lilac focus:ring-skn-lilac/40"
              />
              {INGREDIENT_LABELS[ing]}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-skn-ink/70">הערות</label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={product?.notes ?? ""}
          className="rounded-lg border border-skn-sand px-3 py-2 text-sm text-skn-ink focus:border-skn-pink focus:outline-none focus:ring-2 focus:ring-skn-pink/20"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-skn-berry/10 px-3 py-2 text-sm text-skn-berry">{state.error}</p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-skn-pink-deep px-4 py-2 text-sm font-semibold text-white transition hover:brightness-90 disabled:opacity-60"
        >
          {pending ? "שומר..." : product?.id ? "שמירת שינויים" : "הוספת מוצר"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg px-4 py-2 text-sm font-medium text-skn-ink/55 hover:bg-skn-cream"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}
