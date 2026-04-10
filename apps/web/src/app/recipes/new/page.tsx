import { RecipeForm } from '@/components/recipe/RecipeForm';

export const metadata = { title: 'New Recipe — RecipeHub' };

export default function NewRecipePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Create New Recipe</h1>
      <RecipeForm />
    </div>
  );
}
