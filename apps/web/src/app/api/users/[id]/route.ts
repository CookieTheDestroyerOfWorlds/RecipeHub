import { type NextRequest } from 'next/server';
import { eq, count, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, recipes, favorites } from '@/lib/db/schema';
import { getTokenFromRequest } from '@/lib/api/auth-guard';
import { verifyToken } from '@/lib/auth/jwt';
import { success, apiError } from '@/lib/api/response';
import { updateProfileSchema } from '@recipehub/shared';

type Params = { id: string };

export async function GET(_req: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, id) });
    if (!user) return apiError('User not found', 404);

    const [userRecipes, [favCount]] = await Promise.all([
      db.query.recipes.findMany({
        where: eq(recipes.authorId, id),
        orderBy: [desc(recipes.createdAt)],
        limit: 20,
      }),
      db.select({ count: count() }).from(favorites).where(eq(favorites.userId, id)),
    ]);

    return success({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
      recipes: userRecipes.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        description: r.description,
        imageUrl: r.imageUrl,
        difficulty: r.difficulty,
        cuisine: r.cuisine,
        tags: r.tags,
        createdAt: r.createdAt.toISOString(),
      })),
      favoritesCount: favCount?.count ?? 0,
    });
  } catch (err) {
    console.error('[GET /api/users/:id]', err);
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  const token = getTokenFromRequest(req);
  if (!token) return apiError('Authentication required', 401);

  try {
    const currentUser = await verifyToken(token);
    if (currentUser.sub !== id) return apiError('Forbidden', 403);

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? 'Invalid input', 400);
    }

    const data = parsed.data;
    const [updated] = await db
      .update(users)
      .set({
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl || null }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!updated) return apiError('User not found', 404);

    return success({
      id: updated.id,
      username: updated.username,
      displayName: updated.displayName,
      bio: updated.bio,
      avatarUrl: updated.avatarUrl,
      role: updated.role,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    console.error('[PATCH /api/users/:id]', err);
    return apiError('Internal server error', 500);
  }
}
