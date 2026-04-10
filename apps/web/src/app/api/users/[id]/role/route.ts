import { type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/api/auth-guard';
import { success, apiError } from '@/lib/api/response';
import { updateRoleSchema } from '@recipehub/shared';
import type { TokenPayload } from '@/lib/auth/jwt';

type Params = { id: string };

export const PATCH = requireAdmin<Params>(
  async (req: NextRequest, { params }: { params: Promise<Params> }, _user: TokenPayload) => {
    const { id } = await params;
    try {
      const body = await req.json();
      const parsed = updateRoleSchema.safeParse(body);
      if (!parsed.success) {
        return apiError(parsed.error.errors[0]?.message ?? 'Invalid input', 400);
      }

      const [updated] = await db
        .update(users)
        .set({ role: parsed.data.role, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();

      if (!updated) return apiError('User not found', 404);

      return success({
        id: updated.id,
        username: updated.username,
        role: updated.role,
      });
    } catch (err) {
      console.error('[PATCH /api/users/:id/role]', err);
      return apiError('Internal server error', 500);
    }
  }
);
