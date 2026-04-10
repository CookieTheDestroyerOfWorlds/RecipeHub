'use client';

import { useEffect, useState } from 'react';

interface Stats {
  userCount: number;
  recipeCount: number;
  commentCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((json) => setStats(json.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { label: 'Users', value: stats?.userCount ?? 0, icon: '👥' },
            { label: 'Recipes', value: stats?.recipeCount ?? 0, icon: '🍽️' },
            { label: 'Comments', value: stats?.commentCount ?? 0, icon: '💬' },
          ].map((stat) => (
            <div key={stat.label} className="card p-6 flex items-center gap-4">
              <span className="text-4xl">{stat.icon}</span>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
