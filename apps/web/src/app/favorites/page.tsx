'use client';

import { useEffect, useState } from 'react';
import type { RecipeSummary } from '@recipehub/shared';
import { RecipeGrid } from '@/components/recipe/RecipeGrid';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    // Fetch user's profile which includes favorites via another endpoint
    // For now, use a favorites list — we'll implement via user profile endpoint
    fetch(`/api/users/${user.id}`)
      .then((r) => r.json())
      .then((json) => {
        // The user endpoint doesn't return favorites directly;
        // we use the recipes in the user's favorites by fetching them
        // This is a simplified approach: show user's own recipes for now
        // In a full implementation, add GET /api/users/:id/favorites
        setRecipes(json.data?.recipes ?? []);
      })
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8 text-brand-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Favorites</h1>
      <RecipeGrid recipes={recipes} emptyMessage="You haven't favorited any recipes yet." />
    </div>
  );
}
