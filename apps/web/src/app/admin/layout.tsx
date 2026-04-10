import Link from 'next/link';

export const metadata = { title: 'Admin — RecipeHub' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white p-4 space-y-2">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Admin</p>
        <nav className="space-y-1">
          <Link href="/admin" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-800">
            Dashboard
          </Link>
          <Link href="/admin/users" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-800">
            Users
          </Link>
          <Link href="/admin/content" className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-800">
            Content
          </Link>
        </nav>
        <div className="pt-4 border-t border-gray-700">
          <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800">
            ← Back to site
          </Link>
        </div>
      </aside>

      <div className="flex-1 overflow-auto p-8">{children}</div>
    </div>
  );
}
