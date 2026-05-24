import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth.api';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { isAuthenticated, user, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      const { data } = await authApi.getMe();
      if (!isAuthenticated) {
        setAuth(data, null); 
      }
      return data;
    } catch (error) {
      logout();
      return null;
    }
  };

  const login = async (credentials) => {
    try {
      const { data } = await authApi.login(credentials);
      setAuth(data.user, data.access_token);
      toast.success('¡Bienvenido de nuevo!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      await authApi.register(userData);
      toast.success('Cuenta creada. Por favor verifica tu email.');
      navigate('/login');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrarse');
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      logout();
      navigate('/login');
      toast.success('Sesión cerrada correctamente');
    }
  };

  return { isAuthenticated, user, login, register, handleLogout, checkAuth };
};
