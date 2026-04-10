import type { RecipeSummary } from '@recipehub/shared';
import { RecipeCard } from './RecipeCard';

export function RecipeGrid({
  recipes,
  emptyMessage = 'No recipes found.',
}: {
  recipes: RecipeSummary[];
  emptyMessage?: string;
}) {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <span className="text-5xl mb-4">🥘</span>
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {recipes.map((r) => (
        <RecipeCard key={r.id} recipe={r} />
      ))}
    </div>
  );
}
