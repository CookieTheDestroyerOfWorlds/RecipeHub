'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  recipeId: string;
  initialFavorited: boolean;
  initialCount: number;
}

export function FavoriteButton({ recipeId, initialFavorited, initialCount }: FavoriteButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/recipes/${recipeId}/favorite`, { method: 'POST' });
      const json = await res.json();
      if (res.ok) {
        setFavorited(json.data.favorited);
        setCount(json.data.count);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={favorited ? 'danger' : 'secondary'}
      onClick={toggle}
      loading={loading}
      size="sm"
    >
      {favorited ? '❤️' : '🤍'} {count}
    </Button>
  );
}
