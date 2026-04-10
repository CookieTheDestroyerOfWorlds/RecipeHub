import { type NextRequest } from 'next/server';
import { verifyToken, type TokenPayload } from '@/lib/auth/jwt';
import { apiError } from './response';

type RouteHandler<T = Record<string, string>> = (
  req: NextRequest,
  context: { params: Promise<T> },
  user: TokenPayload
) => Promise<Response>;

export function getTokenFromRequest(req: NextRequest): string | null {
  // 1. Try Authorization header (mobile clients)
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  // 2. Try httpOnly cookie (web clients)
  return req.cookies.get('token')?.value ?? null;
}

export function requireAuth<T = Record<string, string>>(
  handler: RouteHandler<T>
): (req: NextRequest, context: { params: Promise<T> }) => Promise<Response> {
  return async (req, context) => {
    const token = getTokenFromRequest(req);
    if (!token) return apiError('Authentication required', 401, 'UNAUTHORIZED');

    try {
      const user = await verifyToken(token);
      return handler(req, context, user);
    } catch {
      return apiError('Invalid or expired token', 401, 'INVALID_TOKEN');
    }
  };
}

export function requireAdmin<T = Record<string, string>>(
  handler: RouteHandler<T>
): (req: NextRequest, context: { params: Promise<T> }) => Promise<Response> {
  return async (req, context) => {
    const token = getTokenFromRequest(req);
    if (!token) return apiError('Authentication required', 401, 'UNAUTHORIZED');

    try {
      const user = await verifyToken(token);
      if (user.role !== 'admin') return apiError('Forbidden', 403, 'FORBIDDEN');
      return handler(req, context, user);
    } catch {
      return apiError('Invalid or expired token', 401, 'INVALID_TOKEN');
    }
  };
}
