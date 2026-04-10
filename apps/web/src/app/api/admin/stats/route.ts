import { type NextRequest } from 'next/server';
import { count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, recipes, comments } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/api/auth-guard';
import { success, apiError } from '@/lib/api/response';
import type { TokenPayload } from '@/lib/auth/jwt';

export const GET = requireAdmin(
  async (_req: NextRequest, _context: { params: Promise<Record<string, string>> }, _user: TokenPayload) => {
    try {
      const [[userCount], [recipeCount], [commentCount]] = await Promise.all([
        db.select({ count: count() }).from(users),
        db.select({ count: count() }).from(recipes),
        db.select({ count: count() }).from(comments),
      ]);

      return success({
        userCount: userCount?.count ?? 0,
        recipeCount: recipeCount?.count ?? 0,
        commentCount: commentCount?.count ?? 0,
      });
    } catch (err) {
      console.error('[GET /api/admin/stats]', err);
      return apiError('Internal server error', 500);
    }
  }
);
