import Link from 'next/link';
import Image from 'next/image';
import type { RecipeSummary } from '@recipehub/shared';
import { Badge } from '@/components/ui/Badge';
import { formatDuration } from '@recipehub/shared';

const difficultyVariant = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
} as const;

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  const totalTime = (recipe.prepTimeMins ?? 0) + (recipe.cookTimeMins ?? 0);

  return (
    <Link href={`/recipes/${recipe.slug}`} className="group block">
      <article className="card overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="relative h-48 bg-gray-100">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl text-gray-300">🍽️</div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant={difficultyVariant[recipe.difficulty]}>
              {recipe.difficulty}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {recipe.title}
          </h3>
          {recipe.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{recipe.description}</p>
          )}

          <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
            <span>by {recipe.author.displayName ?? recipe.author.username}</span>
            <div className="flex items-center gap-3">
              {totalTime > 0 && <span>⏱ {formatDuration(totalTime)}</span>}
              <span>❤️ {recipe.favoriteCount}</span>
              <span>💬 {recipe.commentCount}</span>
            </div>
          </div>

          {recipe.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {recipe.tags.slice(0, 3).map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
