'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import type { CommentWithAuthor } from '@recipehub/shared';

interface CommentFormProps {
  recipeId: string;
  onPosted: (comment: CommentWithAuthor) => void;
}

export function CommentForm({ recipeId, onPosted }: CommentFormProps) {
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <p className="text-sm text-gray-500">
        <a href="/login" className="text-brand-600 hover:underline">Log in</a> to leave a comment.
      </p>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/recipes/${recipeId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message ?? 'Failed to post comment');
        return;
      }
      onPosted(json.data.comment);
      setBody('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a comment…"
        rows={3}
        maxLength={2000}
        className="input resize-none w-full"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button type="submit" loading={submitting} disabled={!body.trim()} size="sm">
        Post Comment
      </Button>
    </form>
  );
}
