import { INGREDIENT_LABELS } from "@/lib/ingredients";
import type { IngredientKey } from "@/lib/types";

export default function IngredientTags({ ingredients }: { ingredients: IngredientKey[] }) {
  if (!ingredients?.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {ingredients.map((ing) => (
        <span key={ing} className="skn-tagchip">
          {INGREDIENT_LABELS[ing] ?? ing}
        </span>
      ))}
    </div>
  );
}
