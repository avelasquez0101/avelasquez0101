import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
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
          user: { ...state.user, ...updates },
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

export default useAuthStore;
