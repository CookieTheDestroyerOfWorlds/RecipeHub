import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getToken, setToken, removeToken } from '@/lib/storage';
import { apiFetch } from '@/lib/api';
import type { PrivateUser } from '@recipehub/shared';

interface AuthState {
  user: PrivateUser | null;
  loading: boolean;
  login: (user: PrivateUser, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PrivateUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        const result = await apiFetch<PrivateUser>('/api/me');
        if (result.data) setUser(result.data);
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (u: PrivateUser, token: string) => {
    await setToken(token);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
