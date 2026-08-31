"use client";

import { useActionState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import Checkbox from "@/components/Checkbox";
import { upsertProduct, type ProductFormState } from "@/lib/actions/products";
import { ALL_INGREDIENTS, INGREDIENT_LABELS } from "@/lib/ingredients";
import { suggestProductNotes } from "@/lib/productSuggestions";
import type { IngredientKey, Product } from "@/lib/types";

const initialState: ProductFormState = { error: null };

export default function ProductForm({
  product,
  onDone,
}: {
  product?: Product | null;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(upsertProduct, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const skinBenefitsRef = useRef<HTMLTextAreaElement>(null);
  const avoidMixingRef = useRef<HTMLTextAreaElement>(null);

  // כשההגשה הצליחה (אין שגיאה ואין יותר pending) — סוגרים את הטופס
  const succeeded = !pending && state.error === null && state !== initialState;
  useEffect(() => {
    if (succeeded) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [succeeded]);

  // מייצר טיוטה ל"יתרונות לעור" ו"לא לערבב עם" מהמצב הנוכחי של הטופס
  // (שם, מותג, קטגוריה, רכיבים פעילים שמסומנים כרגע) — לא שולח את הטופס,
  // רק ממלא את שני השדות כדי שאפשר יהיה לערוך ולאשר לפני שמירה.
  function handleSuggest() {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const suggestion = suggestProductNotes({
      name: String(fd.get("name") ?? ""),
      brand: String(fd.get("brand") ?? ""),
      category: String(fd.get("category") ?? ""),
      activeIngredients: fd.getAll("active_ingredients").map((v) => String(v)) as IngredientKey[],
    });
    if (skinBenefitsRef.current) skinBenefitsRef.current.value = suggestion.skinBenefits;
    if (avoidMixingRef.current) avoidMixingRef.current.value = suggestion.avoidMixingWith;
  }

  return (
    <form
      ref={formRef}
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

        <div className="flex items-center pt-6">
          <Checkbox
            name="is_device"
            defaultChecked={product?.is_device ?? false}
            tone="neutral"
            label="זהו מכשיר (לא מוצר מתכלה, למשל מסכת LED)"
            labelClassName="text-sm text-skn-ink/70"
          />
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
            <Checkbox
              key={ing}
              name="active_ingredients"
              value={ing}
              defaultChecked={product?.active_ingredients?.includes(ing) ?? false}
              tone="lilac"
              label={INGREDIENT_LABELS[ing]}
              labelClassName="text-sm text-skn-ink/65"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-skn-sand p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-skn-ink/70">
            יתרונות לעור ומה לא לערבב
          </p>
          <button
            type="button"
            onClick={handleSuggest}
            className="inline-flex items-center gap-1.5 rounded-lg border border-skn-lilac/30 bg-skn-lilac/10 px-3 py-1.5 text-xs font-medium text-skn-lilac hover:bg-skn-lilac/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            הצע תיאור אוטומטי
          </button>
        </div>
        <p className="text-xs text-skn-ink/40">
          הטיוטה נוצרת מהרכיבים הפעילים שסימנת למעלה — אפשר לערוך אותה
          בחופשיות. שום דבר לא נשמר עד שלוחצים על &ldquo;שמירה&rdquo;.
        </p>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-skn-ink/70">יתרונות לעור</label>
          <textarea
            ref={skinBenefitsRef}
            name="skin_benefits"
            rows={2}
            defaultValue={product?.skin_benefits ?? ""}
            placeholder="למה המוצר משמש ומה הוא עושה לעור..."
            className="rounded-lg border border-skn-sand px-3 py-2 text-sm text-skn-ink focus:border-skn-pink focus:outline-none focus:ring-2 focus:ring-skn-pink/20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-skn-ink/70">לא לערבב עם</label>
          <textarea
            ref={avoidMixingRef}
            name="avoid_mixing_with"
            rows={2}
            defaultValue={product?.avoid_mixing_with ?? ""}
            placeholder="רכיבים או סוגי מוצרים שלא כדאי לשלב עם זה..."
            className="rounded-lg border border-skn-sand px-3 py-2 text-sm text-skn-ink focus:border-skn-pink focus:outline-none focus:ring-2 focus:ring-skn-pink/20"
          />
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
