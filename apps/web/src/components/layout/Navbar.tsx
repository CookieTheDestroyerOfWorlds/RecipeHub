'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-brand-600">
          <span className="text-2xl">🍳</span>
          RecipeHub
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 sm:flex">
          <Link href="/recipes" className="hover:text-brand-600 transition-colors">
            Browse
          </Link>
          {user && (
            <>
              <Link href="/recipes/new" className="hover:text-brand-600 transition-colors">
                Add Recipe
              </Link>
              <Link href="/favorites" className="hover:text-brand-600 transition-colors">
                Favorites
              </Link>
            </>
          )}
          {user?.role === 'admin' && (
            <Link href="/admin" className="hover:text-brand-600 transition-colors text-red-600">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href={`/profile/${user.username}`}
                className="text-sm font-medium text-gray-700 hover:text-brand-600"
              >
                {user.displayName ?? user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary text-xs px-3 py-1.5">
                Log in
              </Link>
              <Link href="/register" className="btn-primary text-xs px-3 py-1.5">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
