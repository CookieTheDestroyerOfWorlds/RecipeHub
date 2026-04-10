import { type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { comparePassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { success, apiError } from '@/lib/api/response';
import { loginSchema } from '@recipehub/shared';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message ?? 'Invalid input', 400, 'VALIDATION_ERROR');
    }

    const { email, password } = parsed.data;

    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) return apiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return apiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');

    const token = await signToken({ sub: user.id, role: user.role, username: user.username });

    const response = success({
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
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (err) {
    console.error('[login]', err);
    return apiError('Internal server error', 500);
  }
}
