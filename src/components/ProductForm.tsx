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
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">שם המוצר *</label>
          <input
            name="name"
            required
            defaultValue={product?.name ?? ""}
            placeholder="לדוגמה: סרום ויטמין C"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">מותג</label>
          <input
            name="brand"
            defaultValue={product?.brand ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">קטגוריה</label>
          <input
            name="category"
            defaultValue={product?.category ?? ""}
            placeholder="סרום / קרם / מסכה / מכשיר..."
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            id="is_device"
            name="is_device"
            type="checkbox"
            defaultChecked={product?.is_device ?? false}
            className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-400"
          />
          <label htmlFor="is_device" className="text-sm text-slate-700">
            זהו מכשיר (לא מוצר מתכלה, למשל מסכת LED)
          </label>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">תאריך פתיחה</label>
          <input
            name="open_date"
            type="date"
            defaultValue={product?.open_date ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
          <p className="text-xs text-slate-400">השאירי ריק אם עדיין לא נפתח</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">
            תוקף לאחר פתיחה (בחודשים)
          </label>
          <input
            name="shelf_life_months"
            type="number"
            min={1}
            max={60}
            defaultValue={product?.shelf_life_months ?? 6}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">
            תאריך תפוגה קבוע (אופציונלי — גובר על החישוב האוטומטי)
          </label>
          <input
            name="expiry_date_override"
            type="date"
            defaultValue={product?.expiry_date_override ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 sm:w-1/2"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">רכיבים פעילים</label>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {ALL_INGREDIENTS.map((ing) => (
            <label key={ing} className="flex items-center gap-1.5 text-sm text-slate-600">
              <input
                type="checkbox"
                name="active_ingredients"
                value={ing}
                defaultChecked={product?.active_ingredients?.includes(ing) ?? false}
                className="h-4 w-4 rounded border-slate-300 text-violet-500 focus:ring-violet-400"
              />
              {INGREDIENT_LABELS[ing]}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">הערות</label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={product?.notes ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
        >
          {pending ? "שומר..." : product?.id ? "שמירת שינויים" : "הוספת מוצר"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}
