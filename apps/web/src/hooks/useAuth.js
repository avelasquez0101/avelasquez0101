import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

const useAuth = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email, password) => {
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, token, refreshToken } = response.data;
          
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            message: error.response?.data?.message || 'Error al iniciar sesión' 
          };
        }
      },

      register: async (userData) => {
        try {
          const response = await api.post('/auth/register', userData);
          const { user, token, refreshToken } = response.data;
          
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            message: error.response?.data?.message || 'Error al registrarse' 
          };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false
        });
      },

      refreshAuthToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          return false;
        }

        try {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { token, refreshToken: newRefreshToken } = response.data;
          
          set({ token, refreshToken: newRefreshToken });
          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },

      checkAuth: async () => {
        const { token, refreshToken } = get();
        
        if (!token && !refreshToken) {
          set({ isLoading: false });
          return;
        }

        if (!token && refreshToken) {
          await get().refreshAuthToken();
          return;
        }

        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.user, isLoading: false });
        } catch (error) {
          if (error.response?.status === 401) {
            await get().refreshAuthToken();
          } else {
            get().logout();
          }
        }
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuth;
