import { INGREDIENT_LABELS } from "@/lib/ingredients";
import type { IngredientKey } from "@/lib/types";

export default function IngredientTags({
  ingredients,
}: {
  ingredients: IngredientKey[];
}) {
  if (!ingredients?.length) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {ingredients.map((ing) => (
        <span
          key={ing}
          className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700"
        >
          {INGREDIENT_LABELS[ing] ?? ing}
        </span>
      ))}
    </div>
  );
}
