import { type NextRequest } from 'next/server';
import { eq, desc, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { comments, recipes } from '@/lib/db/schema';
import { getTokenFromRequest } from '@/lib/api/auth-guard';
import { verifyToken } from '@/lib/auth/jwt';
import { success, apiError } from '@/lib/api/response';
import { createCommentSchema } from '@recipehub/shared';

type Params = { id: string };

export async function GET(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
  const offset = (page - 1) * limit;

  try {
    const [totalResult, rows] = await Promise.all([
      db.select({ count: count() }).from(comments).where(eq(comments.recipeId, id)),
      db.query.comments.findMany({
        where: eq(comments.recipeId, id),
        with: { author: true },
        orderBy: [desc(comments.createdAt)],
        limit,
        offset,
      }),
    ]);

    const total = totalResult[0]?.count ?? 0;

    return success({
      items: rows.map((c) => ({
        id: c.id,
        recipeId: c.recipeId,
        body: c.body,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        author: c.author
          ? {
              id: c.author.id,
              username: c.author.username,
              displayName: c.author.displayName,
              avatarUrl: c.author.avatarUrl,
            }
          : null,
      })),
      total,
      page,
      limit,
      hasMore: offset + rows.length < total,
    });
  } catch (err) {
    console.error('[GET /api/recipes/:id/comments]', err);
    return apiError('Internal server error', 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  const token = getTokenFromRequest(req);
  if (!token) return apiError('Authentication required', 401);

  try {
    const user = await verifyToken(token);
    const recipe = await db.query.recipes.findFirst({ where: eq(recipes.id, id) });
    if (!recipe) return apiError('Recipe not found', 404);

    const body = await req.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? 'Invalid input', 400);
    }

    const [comment] = await db
      .insert(comments)
      .values({ recipeId: id, authorId: user.sub, body: parsed.data.body })
      .returning();

    if (!comment) return apiError('Failed to create comment', 500);

    return success(
      {
        comment: {
          id: comment.id,
          recipeId: comment.recipeId,
          body: comment.body,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString(),
          author: {
            id: user.sub,
            username: user.username,
            displayName: null,
            avatarUrl: null,
          },
        },
      },
      201
    );
  } catch (err) {
    console.error('[POST /api/recipes/:id/comments]', err);
    return apiError('Internal server error', 500);
  }
}
