import { type NextRequest } from 'next/server';
import { eq, count, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, recipes, favorites } from '@/lib/db/schema';
import { success, apiError } from '@/lib/api/response';

type Params = { username: string };

export async function GET(_req: NextRequest, { params }: { params: Promise<Params> }) {
  const { username } = await params;
  try {
    const user = await db.query.users.findFirst({ where: eq(users.username, username) });
    if (!user) return apiError('User not found', 404);

    const [userRecipes, [favCount]] = await Promise.all([
      db.query.recipes.findMany({
        where: eq(recipes.authorId, user.id),
        orderBy: [desc(recipes.createdAt)],
        limit: 20,
      }),
      db.select({ count: count() }).from(favorites).where(eq(favorites.userId, user.id)),
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
        prepTimeMins: r.prepTimeMins,
        cookTimeMins: r.cookTimeMins,
        servings: r.servings,
        tags: r.tags,
        favoriteCount: 0,
        commentCount: 0,
        author: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        },
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      favoritesCount: favCount?.count ?? 0,
    });
  } catch (err) {
    console.error('[GET /api/users/by-username/:username]', err);
    return apiError('Internal server error', 500);
  }
}
