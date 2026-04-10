import Link from 'next/link';
import { RecipeGrid } from '@/components/recipe/RecipeGrid';
import type { RecipeSummary } from '@recipehub/shared';

async function getRecentRecipes(): Promise<RecipeSummary[]> {
  try {
    const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/recipes?limit=8`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.items ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const recipes = await getRecentRecipes();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-400 to-brand-600 py-20 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Share Food, Share Love
          </h1>
          <p className="mt-4 text-lg text-brand-100">
            Discover thousands of recipes from cooks around the world, or share your own culinary creations.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/recipes"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-brand-600 shadow hover:bg-brand-50 transition-colors"
            >
              Browse Recipes
            </Link>
            <Link
              href="/register"
              className="rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-brand-500 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Recent recipes */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Recent Recipes</h2>
          <Link href="/recipes" className="text-sm font-medium text-brand-600 hover:underline">
            View all →
          </Link>
        </div>
        <RecipeGrid recipes={recipes} emptyMessage="No recipes yet — be the first!" />
      </section>
    </div>
  );
}
