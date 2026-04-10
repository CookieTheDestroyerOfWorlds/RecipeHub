import { type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getTokenFromRequest } from '@/lib/api/auth-guard';
import { verifyToken } from '@/lib/auth/jwt';
import { success, apiError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return apiError('Authentication required', 401);

  try {
    const payload = await verifyToken(token);
    const user = await db.query.users.findFirst({ where: eq(users.id, payload.sub) });
    if (!user) return apiError('User not found', 404);

    return success({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
    });
  } catch {
    return apiError('Invalid token', 401);
  }
}
