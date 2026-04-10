import React, { Suspense } from 'react';
import { RecipeGrid } from '@/components/recipe/RecipeGrid';
import { RecipeFilters } from '@/components/recipe/RecipeFilters';
import { Spinner } from '@/components/ui/Spinner';
import type { RecipeSummary, PaginatedResponse } from '@recipehub/shared';
import Link from 'next/link';

export const metadata = { title: 'Browse Recipes — RecipeHub' };

interface Props {
  searchParams: Promise<{
    q?: string;
    cuisine?: string;
    difficulty?: string;
    tag?: string;
    page?: string;
  }>;
}

async function getRecipes(params: Awaited<Props['searchParams']>): Promise<PaginatedResponse<RecipeSummary>> {
  const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.cuisine) query.set('cuisine', params.cuisine);
  if (params.difficulty) query.set('difficulty', params.difficulty);
  if (params.tag) query.set('tag', params.tag);
  if (params.page) query.set('page', params.page);
  query.set('limit', '20');

  const res = await fetch(`${baseUrl}/api/recipes?${query}`, { cache: 'no-store' });
  if (!res.ok) return { items: [], total: 0, page: 1, limit: 20, hasMore: false };
  const json = await res.json();
  return json.data ?? { items: [], total: 0, page: 1, limit: 20, hasMore: false };
}

export default async function RecipesPage({ searchParams }: Props) {
  const params = await searchParams;
  const data = await getRecipes(params);
  const currentPage = parseInt(params.page ?? '1');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Recipes {data.total > 0 && <span className="text-gray-400 font-normal text-lg">({data.total})</span>}
        </h1>
        <Link href="/recipes/new" className="btn-primary">
          + New Recipe
        </Link>
      </div>

      <Suspense fallback={null}>
        <div className="mb-6">
          <RecipeFilters />
        </div>
      </Suspense>

      <Suspense fallback={<div className="flex justify-center py-16"><Spinner className="h-8 w-8 text-brand-500" /></div>}>
        <RecipeGrid recipes={data.items} emptyMessage="No recipes match your search." />
      </Suspense>

      {/* Pagination */}
      {(data.hasMore || currentPage > 1) && (
        <div className="mt-10 flex justify-center gap-3">
          {currentPage > 1 && (
            <Link
              href={`/recipes?page=${currentPage - 1}`}
              className="btn-secondary"
            >
              ← Previous
            </Link>
          )}
          {data.hasMore && (
            <Link
              href={`/recipes?page=${currentPage + 1}`}
              className="btn-primary"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
