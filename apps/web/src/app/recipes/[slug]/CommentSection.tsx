'use client';

import { useState, useEffect } from 'react';
import type { CommentWithAuthor } from '@recipehub/shared';
import { CommentList } from '@/components/comment/CommentList';
import { CommentForm } from '@/components/comment/CommentForm';

export function CommentSection({ recipeId }: { recipeId: string }) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/recipes/${recipeId}/comments`)
      .then((r) => r.json())
      .then((json) => setComments(json.data?.items ?? []))
      .finally(() => setLoading(false));
  }, [recipeId]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Comments ({comments.length})</h2>
      <div className="mb-6">
        <CommentForm
          recipeId={recipeId}
          onPosted={(c) => setComments((prev) => [c, ...prev])}
        />
      </div>
      {loading ? (
        <p className="text-sm text-gray-400">Loading comments…</p>
      ) : (
        <CommentList
          comments={comments}
          onDelete={(id) => setComments((prev) => prev.filter((c) => c.id !== id))}
        />
      )}
    </div>
  );
}
