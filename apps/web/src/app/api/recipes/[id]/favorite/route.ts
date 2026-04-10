import { type NextRequest } from 'next/server';
import { eq, and, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { favorites, recipes } from '@/lib/db/schema';
import { getTokenFromRequest } from '@/lib/api/auth-guard';
import { verifyToken } from '@/lib/auth/jwt';
import { success, apiError } from '@/lib/api/response';

type Params = { id: string };

export async function POST(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  const token = getTokenFromRequest(req);
  if (!token) return apiError('Authentication required', 401);

  try {
    const user = await verifyToken(token);

    const recipe = await db.query.recipes.findFirst({ where: eq(recipes.id, id) });
    if (!recipe) return apiError('Recipe not found', 404);

    const existing = await db.query.favorites.findFirst({
      where: (f, { and }) => and(eq(f.userId, user.sub), eq(f.recipeId, id)),
    });

    if (existing) {
      await db
        .delete(favorites)
        .where(and(eq(favorites.userId, user.sub), eq(favorites.recipeId, id)));
    } else {
      await db.insert(favorites).values({ userId: user.sub, recipeId: id });
    }

    const [[countResult]] = await Promise.all([
      db.select({ count: count() }).from(favorites).where(eq(favorites.recipeId, id)),
    ]);

    return success({ favorited: !existing, count: countResult?.count ?? 0 });
  } catch (err) {
    console.error('[POST /api/recipes/:id/favorite]', err);
    return apiError('Internal server error', 500);
  }
}
