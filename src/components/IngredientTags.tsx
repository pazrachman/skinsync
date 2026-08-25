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
          className="rounded-full bg-skn-lilac/10 px-2 py-0.5 text-xs font-medium text-skn-lilac"
        >
          {INGREDIENT_LABELS[ing] ?? ing}
        </span>
      ))}
    </div>
  );
}
