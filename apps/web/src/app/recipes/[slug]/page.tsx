import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { RecipeDetail, CommentWithAuthor } from '@recipehub/shared';
import { formatDate, formatDuration } from '@recipehub/shared';
import { Badge } from '@/components/ui/Badge';
import { CommentSection } from './CommentSection';
import { FavoriteButton } from './FavoriteButton';
import { Avatar } from '@/components/ui/Avatar';

async function getRecipe(slug: string): Promise<RecipeDetail | null> {
  // We need to find recipe by slug — fetch list filtered, or use a slug-based lookup
  const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';
  // Get by slug: fetch all and filter (in production we'd add a /api/recipes/by-slug/:slug endpoint)
  const res = await fetch(`${baseUrl}/api/recipes?q=${encodeURIComponent(slug)}&limit=50`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  const items = json.data?.items ?? [];
  const found = items.find((r: { slug: string }) => r.slug === slug);
  if (!found) return null;

  // Get full detail
  const detailRes = await fetch(`${baseUrl}/api/recipes/${found.id}`, { cache: 'no-store' });
  if (!detailRes.ok) return null;
  const detailJson = await detailRes.json();
  return detailJson.data?.recipe ?? null;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function RecipeDetailPage({ params }: Props) {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) notFound();

  const totalTime = (recipe.prepTimeMins ?? 0) + (recipe.cookTimeMins ?? 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              <Badge variant={recipe.difficulty === 'easy' ? 'success' : recipe.difficulty === 'medium' ? 'warning' : 'danger'}>
                {recipe.difficulty}
              </Badge>
              {recipe.cuisine && <Badge>{recipe.cuisine}</Badge>}
              {recipe.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
          <FavoriteButton recipeId={recipe.id} initialFavorited={recipe.isFavorited ?? false} initialCount={recipe.favoriteCount} />
        </div>

        <div className="mt-4 flex items-center gap-4">
          <Link href={`/profile/${recipe.author.username}`} className="flex items-center gap-2 hover:text-brand-600">
            <Avatar src={recipe.author.avatarUrl} alt={recipe.author.displayName ?? recipe.author.username} size={32} />
            <span className="text-sm font-medium">{recipe.author.displayName ?? recipe.author.username}</span>
          </Link>
          <span className="text-sm text-gray-400">{formatDate(recipe.createdAt)}</span>
        </div>
      </div>

      {/* Image */}
      {recipe.imageUrl && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-xl sm:h-96">
          <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" />
        </div>
      )}

      {/* Meta */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {recipe.prepTimeMins != null && (
          <div className="card p-4 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Prep</p>
            <p className="mt-1 text-lg font-semibold">{formatDuration(recipe.prepTimeMins)}</p>
          </div>
        )}
        {recipe.cookTimeMins != null && (
          <div className="card p-4 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Cook</p>
            <p className="mt-1 text-lg font-semibold">{formatDuration(recipe.cookTimeMins)}</p>
          </div>
        )}
        {totalTime > 0 && (
          <div className="card p-4 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total</p>
            <p className="mt-1 text-lg font-semibold">{formatDuration(totalTime)}</p>
          </div>
        )}
        {recipe.servings != null && (
          <div className="card p-4 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Servings</p>
            <p className="mt-1 text-lg font-semibold">{recipe.servings}</p>
          </div>
        )}
      </div>

      {/* Description */}
      {recipe.description && (
        <p className="mb-8 text-gray-600 leading-relaxed">{recipe.description}</p>
      )}

      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        {/* Ingredients */}
        <div className="md:col-span-1">
          <h2 className="text-xl font-bold mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="font-medium text-brand-600 shrink-0">
                  {ing.amount} {ing.unit}
                </span>
                <span className="text-gray-700">{ing.name}</span>
                {ing.notes && <span className="text-gray-400 italic">({ing.notes})</span>}
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Instructions</h2>
          <ol className="space-y-6">
            {recipe.steps
              .sort((a, b) => a.order - b.order)
              .map((step) => (
                <li key={step.order} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-sm">
                    {step.order}
                  </span>
                  <p className="text-gray-700 leading-relaxed pt-1">{step.instruction}</p>
                </li>
              ))}
          </ol>
        </div>
      </div>

      {/* Edit link (shown client-side via CommentSection which has auth context) */}
      <div className="mt-4 text-right">
        <Link href={`/recipes/${slug}/edit`} className="text-sm text-gray-400 hover:text-brand-600">
          Edit this recipe
        </Link>
      </div>

      {/* Comments */}
      <div className="mt-12">
        <CommentSection recipeId={recipe.id} />
      </div>
    </div>
  );
}
