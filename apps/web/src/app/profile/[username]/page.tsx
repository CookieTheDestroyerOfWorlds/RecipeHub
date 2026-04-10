'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { PublicUser, RecipeSummary } from '@recipehub/shared';
import { RecipeGrid } from '@/components/recipe/RecipeGrid';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, refresh } = useAuth();
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/users/by-username/${username}`)
      .then((r) => r.json())
      .then((json) => {
        setProfile(json.data?.user ?? null);
        setRecipes(json.data?.recipes ?? []);
        setDisplayName(json.data?.user?.displayName ?? '');
        setBio(json.data?.user?.bio ?? '');
      })
      .finally(() => setLoading(false));
  }, [username]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const res = await fetch(`/api/users/${profile.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, bio }),
    });
    if (res.ok) {
      const json = await res.json();
      setProfile((p) => (p ? { ...p, ...json.data } : p));
      setEditing(false);
      await refresh();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8 text-brand-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center py-20 text-gray-500">
        <p>User not found.</p>
      </div>
    );
  }

  const isOwn = currentUser?.id === profile.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Profile header */}
      <div className="card p-6 mb-8">
        <div className="flex items-start gap-6 flex-wrap">
          <Avatar src={profile.avatarUrl} alt={profile.displayName ?? profile.username} size={80} />
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="label">Display name</label>
                  <input
                    className="input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Bio</label>
                  <textarea
                    className="input resize-y"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} loading={saving} size="sm">
                    Save
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.displayName ?? profile.username}
                </h1>
                <p className="text-sm text-gray-500 mt-1">@{profile.username}</p>
                {profile.bio && <p className="mt-3 text-gray-600">{profile.bio}</p>}
                <p className="mt-2 text-xs text-gray-400">{recipes.length} recipes</p>
              </>
            )}
          </div>
          {isOwn && !editing && (
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Recipes */}
      <h2 className="text-xl font-bold mb-6">Recipes by {profile.displayName ?? profile.username}</h2>
      <RecipeGrid recipes={recipes} emptyMessage="No recipes published yet." />
    </div>
  );
}
