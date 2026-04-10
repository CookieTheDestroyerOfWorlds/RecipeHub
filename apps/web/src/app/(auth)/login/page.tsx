import Link from 'next/link';
import React, { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = { title: 'Log in — RecipeHub' };

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Log in</h1>
          <Suspense fallback={<p className="text-sm text-gray-400">Loading…</p>}>
            <LoginForm />
          </Suspense>
          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-600 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
