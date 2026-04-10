'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { CUISINES, DIFFICULTIES } from '@recipehub/shared';

export function RecipeFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`/recipes?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="search"
        placeholder="Search recipes…"
        defaultValue={searchParams.get('q') ?? ''}
        onChange={(e) => updateParam('q', e.target.value)}
        className="input max-w-xs"
      />

      <select
        defaultValue={searchParams.get('cuisine') ?? ''}
        onChange={(e) => updateParam('cuisine', e.target.value)}
        className="input w-auto"
      >
        <option value="">All cuisines</option>
        {CUISINES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get('difficulty') ?? ''}
        onChange={(e) => updateParam('difficulty', e.target.value)}
        className="input w-auto"
      >
        <option value="">Any difficulty</option>
        {DIFFICULTIES.map((d) => (
          <option key={d} value={d}>
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
