'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { RecipeDetail } from '@recipehub/shared';
import { RecipeForm } from '@/components/recipe/RecipeForm';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';

export default function EditRecipePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch recipe by slug
    fetch(`/api/recipes?q=${encodeURIComponent(slug)}&limit=50`)
      .then((r) => r.json())
      .then(async (json) => {
        const found = json.data?.items?.find((r: { slug: string }) => r.slug === slug);
        if (!found) {
          setError('Recipe not found');
          return;
        }
        if (found.author.id !== user.id && user.role !== 'admin') {
          router.push('/');
          return;
        }
        const detailRes = await fetch(`/api/recipes/${found.id}`);
        const detailJson = await detailRes.json();
        setRecipe(detailJson.data?.recipe ?? null);
      })
      .finally(() => setLoading(false));
  }, [slug, user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8 text-brand-500" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex justify-center py-20 text-gray-500">
        <p>{error ?? 'Recipe not found'}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Recipe</h1>
      <RecipeForm
        recipeId={recipe.id}
        initialValues={{
          title: recipe.title,
          description: recipe.description ?? undefined,
          imageUrl: recipe.imageUrl ?? undefined,
          cuisine: recipe.cuisine ?? undefined,
          difficulty: recipe.difficulty,
          prepTimeMins: recipe.prepTimeMins ?? undefined,
          cookTimeMins: recipe.cookTimeMins ?? undefined,
          servings: recipe.servings ?? undefined,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          tags: recipe.tags,
        }}
        onSuccess={(newSlug) => {
          router.push(`/recipes/${newSlug || slug}`);
          router.refresh();
        }}
      />
    </div>
  );
}
