'use client';
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'expert' | 'admin';
  bio?: string;
  reputation?: number;
}

export interface AuthExpert {
  id: string;
  name: string;
  domain?: { name: string; icon: string };
  rating: number;
  bio?: string;
}

interface AuthState {
  user: AuthUser | null;
  expert: AuthExpert | null;
  unreadNotifications: number;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, expert: null, unreadNotifications: 0, loading: true,
  refresh: async () => {}, logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, expert: null, unreadNotifications: 0, loading: true });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) { setState(s => ({ ...s, user: null, expert: null, loading: false })); return; }
      const data = await res.json();
      setState({ user: data.user, expert: data.expert, unreadNotifications: data.unreadNotifications ?? 0, loading: false });
    } catch {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setState({ user: null, expert: null, unreadNotifications: 0, loading: false });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return <AuthContext.Provider value={{ ...state, refresh, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
