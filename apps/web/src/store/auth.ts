'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
  chcoins: number;
  xp: number;
  vipLevel: number;
  streakCount: number;
  role: 'user' | 'admin';
  gamePreference?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (userData: User, accessToken: string, refreshToken: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  logout: () => void;
  getUser: () => User | null;
  getToken: () => string | null;
  getChcoins: () => number;
  getXp: () => number;
  getVipLevel: () => number;
  getStreak: () => number;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (userData, accessToken, refreshToken) =>
        set({
          user: userData,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      updateProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      // Getters
      getUser: () => get().user,
      getToken: () => get().accessToken,
      getChcoins: () => get().user?.chcoins || 0,
      getXp: () => get().user?.xp || 0,
      getVipLevel: () => get().user?.vipLevel || 0,
      getStreak: () => get().user?.streakCount || 0,
    }),
    {
      name: 'auth-storage',
    }
  )
);
