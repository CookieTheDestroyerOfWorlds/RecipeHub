import { type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { comments } from '@/lib/db/schema';
import { getTokenFromRequest } from '@/lib/api/auth-guard';
import { verifyToken } from '@/lib/auth/jwt';
import { success, apiError } from '@/lib/api/response';

type Params = { id: string };

export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  const token = getTokenFromRequest(req);
  if (!token) return apiError('Authentication required', 401);

  try {
    const user = await verifyToken(token);
    const comment = await db.query.comments.findFirst({ where: eq(comments.id, id) });
    if (!comment) return apiError('Comment not found', 404);

    if (comment.authorId !== user.sub && user.role !== 'admin') {
      return apiError('Forbidden', 403);
    }

    await db.delete(comments).where(eq(comments.id, id));
    return success({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/comments/:id]', err);
    return apiError('Internal server error', 500);
  }
}
