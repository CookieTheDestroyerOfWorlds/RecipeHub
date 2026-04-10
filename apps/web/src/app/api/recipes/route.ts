import { type NextRequest } from 'next/server';
import { eq, ilike, and, sql, desc, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { recipes, favorites, comments } from '@/lib/db/schema';
import { getTokenFromRequest } from '@/lib/api/auth-guard';
import { verifyToken } from '@/lib/auth/jwt';
import { success, apiError } from '@/lib/api/response';
import { createRecipeSchema, recipeQuerySchema, slugify } from '@recipehub/shared';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = recipeQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!query.success) return apiError('Invalid query parameters', 400);

    const { q, cuisine, difficulty, tag, page, limit, authorId } = query.data;
    const offset = (page - 1) * limit;

    const conditions = [eq(recipes.isPublished, true)];

    if (q) conditions.push(ilike(recipes.title, `%${q}%`));
    if (cuisine) conditions.push(eq(recipes.cuisine, cuisine));
    if (difficulty) conditions.push(eq(recipes.difficulty, difficulty));
    if (tag) conditions.push(sql`${recipes.tags} @> ARRAY[${tag}]::text[]`);
    if (authorId) conditions.push(eq(recipes.authorId, authorId));

    const where = and(...conditions);

    const [totalResult, rows] = await Promise.all([
      db.select({ count: count() }).from(recipes).where(where),
      db.query.recipes.findMany({
        where,
        with: { author: true },
        orderBy: [desc(recipes.createdAt)],
        limit,
        offset,
      }),
    ]);

    const total = totalResult[0]?.count ?? 0;

    // Get favorite and comment counts for each recipe
    const recipeIds = rows.map((r) => r.id);
    const [favCounts, commentCounts] = await Promise.all([
      recipeIds.length > 0
        ? db
            .select({ recipeId: favorites.recipeId, count: count() })
            .from(favorites)
            .where(sql`${favorites.recipeId} = ANY(${recipeIds})`)
            .groupBy(favorites.recipeId)
        : [],
      recipeIds.length > 0
        ? db
            .select({ recipeId: comments.recipeId, count: count() })
            .from(comments)
            .where(sql`${comments.recipeId} = ANY(${recipeIds})`)
            .groupBy(comments.recipeId)
        : [],
    ]);

    const favMap = new Map(favCounts.map((f) => [f.recipeId, f.count]));
    const commentMap = new Map(commentCounts.map((c) => [c.recipeId, c.count]));

    const items = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      imageUrl: r.imageUrl,
      cuisine: r.cuisine,
      difficulty: r.difficulty,
      prepTimeMins: r.prepTimeMins,
      cookTimeMins: r.cookTimeMins,
      servings: r.servings,
      tags: r.tags,
      favoriteCount: favMap.get(r.id) ?? 0,
      commentCount: commentMap.get(r.id) ?? 0,
      author: {
        id: r.author.id,
        username: r.author.username,
        displayName: r.author.displayName,
        avatarUrl: r.author.avatarUrl,
      },
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return success({ items, total, page, limit, hasMore: offset + rows.length < total });
  } catch (err) {
    console.error('[GET /api/recipes]', err);
    return apiError('Internal server error', 500);
  }
}

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return apiError('Authentication required', 401);

  try {
    const user = await verifyToken(token);
    const body = await req.json();
    const parsed = createRecipeSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? 'Invalid input', 400, 'VALIDATION_ERROR');
    }

    const data = parsed.data;
    let slug = slugify(data.title);

    // Ensure slug uniqueness
    const existing = await db.query.recipes.findFirst({ where: eq(recipes.slug, slug) });
    if (existing) slug = `${slug}-${Date.now()}`;

    const [recipe] = await db
      .insert(recipes)
      .values({
        slug,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl || null,
        authorId: user.sub,
        cuisine: data.cuisine,
        difficulty: data.difficulty,
        prepTimeMins: data.prepTimeMins,
        cookTimeMins: data.cookTimeMins,
        servings: data.servings,
        ingredients: data.ingredients,
        steps: data.steps,
        tags: data.tags ?? [],
        isPublished: data.isPublished ?? true,
      })
      .returning();

    if (!recipe) return apiError('Failed to create recipe', 500);

    return success({ recipe }, 201);
  } catch (err) {
    console.error('[POST /api/recipes]', err);
    return apiError('Internal server error', 500);
  }
}
