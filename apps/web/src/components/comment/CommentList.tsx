'use client';

import { useState } from 'react';
import type { CommentWithAuthor } from '@recipehub/shared';
import { formatRelativeTime } from '@recipehub/shared';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

interface CommentListProps {
  comments: CommentWithAuthor[];
  onDelete?: (id: string) => void;
}

export function CommentList({ comments, onDelete }: CommentListProps) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    setDeleting(id);
    try {
      await fetch(`/api/comments/${id}`, { method: 'DELETE' });
      onDelete?.(id);
    } finally {
      setDeleting(null);
    }
  };

  if (comments.length === 0) {
    return <p className="text-sm text-gray-400">No comments yet. Be the first!</p>;
  }

  return (
    <ul className="space-y-4">
      {comments.map((c) => (
        <li key={c.id} className="flex gap-3">
          <Avatar
            src={c.author?.avatarUrl}
            alt={c.author?.displayName ?? c.author?.username ?? 'Deleted user'}
            size={36}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {c.author?.displayName ?? c.author?.username ?? '[deleted]'}
              </span>
              <span className="text-xs text-gray-400">{formatRelativeTime(c.createdAt)}</span>
            </div>
            <p className="mt-0.5 text-sm text-gray-700 whitespace-pre-wrap">{c.body}</p>
          </div>
          {(user?.id === c.author?.id || user?.role === 'admin') && (
            <Button
              variant="ghost"
              size="sm"
              loading={deleting === c.id}
              onClick={() => handleDelete(c.id)}
              className="text-red-500 hover:text-red-700 shrink-0 self-start"
            >
              Delete
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
