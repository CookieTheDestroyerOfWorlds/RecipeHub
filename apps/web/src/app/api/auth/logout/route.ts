import { success } from '@/lib/api/response';

export async function POST() {
  const response = success({ ok: true });
  response.cookies.set('token', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
