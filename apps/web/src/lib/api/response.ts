import { NextResponse } from 'next/server';

export function success<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data, error: null }, { status });
}

export function apiError(message: string, status = 400, code?: string): NextResponse {
  return NextResponse.json({ data: null, error: { message, code } }, { status });
}
