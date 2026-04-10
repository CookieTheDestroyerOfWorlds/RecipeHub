'use client';

import { useEffect, useState } from 'react';
import type { RecipeSummary } from '@recipehub/shared';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AdminContentPage() {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/recipes?limit=50')
      .then((r) => r.json())
      .then((json) => setRecipes(json.data?.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  const deleteRecipe = async (id: string) => {
    if (!confirm('Delete this recipe? This cannot be undone.')) return;
    setDeleting(id);
    const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    }
    setDeleting(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Content Moderation</h1>
      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-3 pr-6">Title</th>
                <th className="pb-3 pr-6">Author</th>
                <th className="pb-3 pr-6">Difficulty</th>
                <th className="pb-3 pr-6">❤️</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recipes.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 pr-6">
                    <Link href={`/recipes/${r.slug}`} className="font-medium hover:text-brand-600">
                      {r.title}
                    </Link>
                  </td>
                  <td className="py-3 pr-6 text-gray-500">
                    {r.author.displayName ?? r.author.username}
                  </td>
                  <td className="py-3 pr-6 text-gray-500">{r.difficulty}</td>
                  <td className="py-3 pr-6 text-gray-500">{r.favoriteCount}</td>
                  <td className="py-3">
                    <Button
                      variant="danger"
                      size="sm"
                      loading={deleting === r.id}
                      onClick={() => deleteRecipe(r.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
