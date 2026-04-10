'use client';

import { useEffect, useState } from 'react';
import type { AdminUser } from '@recipehub/shared';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@recipehub/shared';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/users?limit=50')
      .then((r) => r.json())
      .then((json) => setUsers(json.data?.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  const toggleRole = async (userId: string, currentRole: string) => {
    setUpdating(userId);
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const res = await fetch(`/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as 'user' | 'admin' } : u))
      );
    }
    setUpdating(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Users</h1>
      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-3 pr-6">Username</th>
                <th className="pb-3 pr-6">Email</th>
                <th className="pb-3 pr-6">Role</th>
                <th className="pb-3 pr-6">Recipes</th>
                <th className="pb-3 pr-6">Joined</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="py-3">
                  <td className="py-3 pr-6 font-medium">{u.username}</td>
                  <td className="py-3 pr-6 text-gray-500">{u.email}</td>
                  <td className="py-3 pr-6">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 pr-6 text-gray-500">{u.recipeCount}</td>
                  <td className="py-3 pr-6 text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="py-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={updating === u.id}
                      onClick={() => toggleRole(u.id, u.role)}
                    >
                      {u.role === 'admin' ? 'Revoke admin' : 'Make admin'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
