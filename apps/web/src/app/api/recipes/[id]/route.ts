import { type NextRequest } from 'next/server';
import { eq, count, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { recipes, favorites, comments } from '@/lib/db/schema';
import { getTokenFromRequest } from '@/lib/api/auth-guard';
import { verifyToken } from '@/lib/auth/jwt';
import { success, apiError } from '@/lib/api/response';
import { updateRecipeSchema } from '@recipehub/shared';

type Params = { id: string };

export async function GET(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  try {
    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, id),
      with: { author: true },
    });
    if (!recipe) return apiError('Recipe not found', 404);

    const token = getTokenFromRequest(req);
    let currentUserId: string | null = null;
    if (token) {
      try {
        const payload = await verifyToken(token);
        currentUserId = payload.sub;
      } catch {
        /* ignore */
      }
    }

    const [[favResult], [commentResult], isFavResult] = await Promise.all([
      db.select({ count: count() }).from(favorites).where(eq(favorites.recipeId, id)),
      db.select({ count: count() }).from(comments).where(eq(comments.recipeId, id)),
      currentUserId
        ? db.query.favorites.findFirst({
            where: (f, { and }) =>
              and(eq(f.userId, currentUserId!), eq(f.recipeId, id)),
          })
        : Promise.resolve(null),
    ]);

    return success({
      recipe: {
        id: recipe.id,
        slug: recipe.slug,
        title: recipe.title,
        description: recipe.description,
        imageUrl: recipe.imageUrl,
        cuisine: recipe.cuisine,
        difficulty: recipe.difficulty,
        prepTimeMins: recipe.prepTimeMins,
        cookTimeMins: recipe.cookTimeMins,
        servings: recipe.servings,
        tags: recipe.tags,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        favoriteCount: favResult?.count ?? 0,
        commentCount: commentResult?.count ?? 0,
        isFavorited: !!isFavResult,
        author: {
          id: recipe.author.id,
          username: recipe.author.username,
          displayName: recipe.author.displayName,
          avatarUrl: recipe.author.avatarUrl,
        },
        createdAt: recipe.createdAt.toISOString(),
        updatedAt: recipe.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('[GET /api/recipes/:id]', err);
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  const token = getTokenFromRequest(req);
  if (!token) return apiError('Authentication required', 401);

  try {
    const user = await verifyToken(token);
    const recipe = await db.query.recipes.findFirst({ where: eq(recipes.id, id) });
    if (!recipe) return apiError('Recipe not found', 404);

    if (recipe.authorId !== user.sub && user.role !== 'admin') {
      return apiError('Forbidden', 403);
    }

    const body = await req.json();
    const parsed = updateRecipeSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? 'Invalid input', 400);
    }

    const data = parsed.data;
    const [updated] = await db
      .update(recipes)
      .set({
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
        ...(data.cuisine !== undefined && { cuisine: data.cuisine }),
        ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
        ...(data.prepTimeMins !== undefined && { prepTimeMins: data.prepTimeMins }),
        ...(data.cookTimeMins !== undefined && { cookTimeMins: data.cookTimeMins }),
        ...(data.servings !== undefined && { servings: data.servings }),
        ...(data.ingredients !== undefined && { ingredients: data.ingredients }),
        ...(data.steps !== undefined && { steps: data.steps }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
        updatedAt: new Date(),
      })
      .where(eq(recipes.id, id))
      .returning();

    return success({ recipe: updated });
  } catch (err) {
    console.error('[PATCH /api/recipes/:id]', err);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  const token = getTokenFromRequest(req);
  if (!token) return apiError('Authentication required', 401);

  try {
    const user = await verifyToken(token);
    const recipe = await db.query.recipes.findFirst({ where: eq(recipes.id, id) });
    if (!recipe) return apiError('Recipe not found', 404);

    if (recipe.authorId !== user.sub && user.role !== 'admin') {
      return apiError('Forbidden', 403);
    }

    await db.delete(recipes).where(eq(recipes.id, id));
    return success({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/recipes/:id]', err);
    return apiError('Internal server error', 500);
  }
}
