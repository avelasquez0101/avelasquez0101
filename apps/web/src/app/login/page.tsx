'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      
      if (response.data.token && response.data.user) {
        login(response.data.token, response.data.user);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            ChGaming
          </h1>
          <p className="text-gray-400 mt-2">Plataforma de Torneos Gamer</p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Iniciar Sesión</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-gray-500 transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder-gray-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-400">
                <input type="checkbox" className="mr-2 rounded bg-gray-900/50 border-gray-600 text-purple-600 focus:ring-purple-500" />
                Recordarme
              </label>
              <a href="#" className="text-purple-400 hover:text-purple-300">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-gray-800/30 rounded-lg">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-xs text-gray-400">Torneos Diarios</div>
          </div>
          <div className="p-4 bg-gray-800/30 rounded-lg">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-xs text-gray-400">Premios Reales</div>
          </div>
          <div className="p-4 bg-gray-800/30 rounded-lg">
            <div className="text-2xl mb-2">🎮</div>
            <div className="text-xs text-gray-400">Multi-Juegos</div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="text-xs text-blue-300 text-center">
            <div className="font-semibold mb-2">🔑 Credenciales de Demo:</div>
            <div>Email: admin@chgaming.com</div>
            <div>Password: admin123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
