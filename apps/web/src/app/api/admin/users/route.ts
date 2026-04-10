import { type NextRequest } from 'next/server';
import { ilike, count, desc, or } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, recipes } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/api/auth-guard';
import { success, apiError } from '@/lib/api/response';
import type { TokenPayload } from '@/lib/auth/jwt';

export const GET = requireAdmin(
  async (req: NextRequest, _context: { params: Promise<Record<string, string>> }, _user: TokenPayload) => {
    try {
      const { searchParams } = req.nextUrl;
      const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
      const q = searchParams.get('q') ?? '';
      const offset = (page - 1) * limit;

      const where = q
        ? or(ilike(users.username, `%${q}%`), ilike(users.email, `%${q}%`))
        : undefined;

      const [totalResult, rows] = await Promise.all([
        db.select({ count: count() }).from(users).where(where),
        db.query.users.findMany({
          where,
          orderBy: [desc(users.createdAt)],
          limit,
          offset,
        }),
      ]);

      const total = totalResult[0]?.count ?? 0;

      // Get recipe counts per user
      const userIds = rows.map((u) => u.id);
      const recipeCounts =
        userIds.length > 0
          ? await db
              .select({ authorId: recipes.authorId, count: count() })
              .from(recipes)
              .groupBy(recipes.authorId)
          : [];

      const recipeCountMap = new Map(recipeCounts.map((r) => [r.authorId, r.count]));

      return success({
        items: rows.map((u) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          displayName: u.displayName,
          bio: u.bio,
          avatarUrl: u.avatarUrl,
          createdAt: u.createdAt.toISOString(),
          recipeCount: recipeCountMap.get(u.id) ?? 0,
        })),
        total,
        page,
        limit,
        hasMore: offset + rows.length < total,
      });
    } catch (err) {
      console.error('[GET /api/admin/users]', err);
      return apiError('Internal server error', 500);
    }
  }
);
