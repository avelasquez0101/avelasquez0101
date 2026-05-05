'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  gamePreference: string;
  level: number;
  xp: number;
  chcoins: number;
  totalTournaments: number;
  wins: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  vipStatus: boolean;
  vipExpiry?: string;
  createdAt: string;
}

interface Transaction {
  id: string;
  type: 'purchase' | 'reward' | 'deposit';
  amount: number;
  currency: 'chcoins' | 'usd';
  description: string;
  date: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'settings'>('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadProfileData();
  }, [isAuthenticated, router]);

  const loadProfileData = async () => {
    try {
      const [profileRes, transactionsRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/transactions/history'),
      ]);

      setProfile(profileRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGameIcon = (game: string) => {
    const icons: Record<string, string> = {
      'free-fire': '🔥',
      'cod-mobile': '🎯',
      'mobile-legends': '⚔️',
      'wild-rift': '🐉',
    };
    return icons[game] || '🎮';
  };

  const getLevelProgress = (xp: number, level: number) => {
    const xpForCurrentLevel = (level - 1) * 1000;
    const xpForNextLevel = level * 1000;
    const progress = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-purple-400 text-xl">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Mi Perfil
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={logout}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white mx-auto mb-4">
                  {profile?.username.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-white">{profile?.username}</h2>
                {profile?.vipStatus && (
                  <div className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white">
                    👑 VIP MEMBER
                  </div>
                )}
              </div>

              {/* Level Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Nivel {profile?.level}</span>
                  <span className="text-purple-400 text-sm">{profile?.xp} XP</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${getLevelProgress(profile?.xp || 0, profile?.level || 1)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round(getLevelProgress(profile?.xp || 0, profile?.level || 1))}% para el siguiente nivel
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400 text-sm">Juego Favorito</span>
                  <span className="text-white font-medium flex items-center gap-2">
                    {profile && getGameIcon(profile.gamePreference)}
                    {profile?.gamePreference.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400 text-sm">Chcoins</span>
                  <span className="text-yellow-400 font-bold">{profile?.chcoins}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400 text-sm">Victorias</span>
                  <span className="text-green-400 font-bold">{profile?.wins}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400 text-sm">Win Rate</span>
                  <span className={`font-bold ${
                    (profile?.winRate || 0) >= 60 ? 'text-green-400' :
                    (profile?.winRate || 0) >= 40 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {profile?.winRate}%
                  </span>
                </div>
              </div>

              {/* Streak */}
              <div className="p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg border border-orange-500/30 mb-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">🔥</div>
                  <div className="text-orange-400 font-bold text-lg">{profile?.currentStreak} días</div>
                  <div className="text-xs text-gray-400">Racha Actual</div>
                  {profile && profile.bestStreak > profile.currentStreak && (
                    <div className="text-xs text-gray-500 mt-1">
                      Mejor racha: {profile.bestStreak} días
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Link
                  href="/store"
                  className="block w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-center transition-colors"
                >
                  Ir a la Tienda
                </Link>
                <Link
                  href="/tournaments"
                  className="block w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg text-center transition-colors"
                >
                  Ver Torneos
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'transactions'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Transacciones
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Configuración
              </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Achievements */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4">🏆 Logros Recientes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-900/50 rounded-lg text-center">
                      <div className="text-3xl mb-2">🎮</div>
                      <div className="text-white font-semibold text-sm">Primer Torneo</div>
                      <div className="text-xs text-gray-500">Participa en tu primer torneo</div>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg text-center">
                      <div className="text-3xl mb-2">🏅</div>
                      <div className="text-white font-semibold text-sm">Primera Victoria</div>
                      <div className="text-xs text-gray-500">Gana tu primer torneo</div>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg text-center">
                      <div className="text-3xl mb-2">🔥</div>
                      <div className="text-white font-semibold text-sm">En Racha</div>
                      <div className="text-xs text-gray-500">3 días consecutivos</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4">📊 Estadísticas Detalladas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Torneos Jugados</div>
                      <div className="text-2xl font-bold text-white">{profile?.totalTournaments}</div>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Mejor Puesto</div>
                      <div className="text-2xl font-bold text-yellow-400">1°</div>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Miembro Desde</div>
                      <div className="text-lg font-bold text-white">
                        {profile ? new Date(profile.createdAt).toLocaleDateString('es-ES') : '-'}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Total Ganado</div>
                      <div className="text-2xl font-bold text-green-400">$0 USD</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">💰 Historial de Transacciones</h3>
                <div className="space-y-3">
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === 'purchase' ? 'bg-red-500/20 text-red-400' :
                            tx.type === 'reward' ? 'bg-green-500/20 text-green-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {tx.type === 'purchase' ? '🛒' : tx.type === 'reward' ? '🎁' : '💳'}
                          </div>
                          <div>
                            <div className="text-white font-semibold">{tx.description}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(tx.date).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                        </div>
                        <div className={`font-bold ${
                          tx.type === 'purchase' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {tx.type === 'purchase' ? '-' : '+'}{tx.amount} {tx.currency.toUpperCase()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No hay transacciones recientes
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">⚙️ Configuración de Cuenta</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={profile?.email}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Juego Favorito</label>
                    <select
                      value={profile?.gamePreference}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="free-fire">Free Fire</option>
                      <option value="cod-mobile">COD Mobile</option>
                      <option value="mobile-legends">Mobile Legends</option>
                      <option value="wild-rift">Wild Rift</option>
                    </select>
                  </div>
                  <div className="pt-4">
                    <button className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200">
                      Guardar Cambios
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
