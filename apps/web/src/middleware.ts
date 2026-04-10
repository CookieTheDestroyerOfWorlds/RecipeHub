import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin/* pages
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login?redirect=/admin', req.url));
    }
    try {
      const payload = await verifyToken(token);
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/?error=forbidden', req.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login?redirect=/admin', req.url));
    }
  }

  // Protect authenticated-only pages
  const protectedPaths = ['/recipes/new', '/favorites', '/profile'];
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url)
      );
    }
    try {
      await verifyToken(token);
    } catch {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/recipes/new', '/favorites', '/profile/:path*'],
};
