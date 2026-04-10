import { type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { success, apiError } from '@/lib/api/response';
import { registerSchema } from '@recipehub/shared';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? 'Invalid input', 400, 'VALIDATION_ERROR');
    }

    const { username, email, password } = parsed.data;

    // Check for existing user
    const existing = await db.query.users.findFirst({
      where: (u, { or }) => or(eq(u.email, email), eq(u.username, username)),
    });
    if (existing) {
      const field = existing.email === email ? 'email' : 'username';
      return apiError(`That ${field} is already taken`, 409, 'CONFLICT');
    }

    const passwordHash = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({ username, email, passwordHash })
      .returning();

    if (!user) return apiError('Failed to create user', 500);

    const token = await signToken({ sub: user.id, role: user.role, username: user.username });

    const response = success(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt.toISOString(),
        },
        token,
      },
      201
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (err) {
    console.error('[register]', err);
    return apiError('Internal server error', 500);
  }
}
