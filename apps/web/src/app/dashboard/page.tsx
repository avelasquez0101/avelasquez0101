'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';

interface Tournament {
  id: string;
  name: string;
  game: string;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  startDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface UserStats {
  totalTournaments: number;
  wins: number;
  chcoins: number;
  xp: number;
  level: number;
  rank: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, router]);

  const loadDashboardData = async () => {
    try {
      const [tournamentsRes, statsRes] = await Promise.all([
        api.get('/tournaments'),
        api.get('/users/me/stats'),
      ]);

      setTournaments(tournamentsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTournament = async (tournamentId: string) => {
    try {
      await api.post(`/tournaments/${tournamentId}/join`);
      alert('¡Te has inscrito exitosamente!');
      loadDashboardData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al unirse al torneo');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-400 bg-blue-400/20';
      case 'ongoing': return 'text-green-400 bg-green-400/20';
      case 'completed': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-purple-400 text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              ChGaming
            </Link>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-white font-semibold">{user?.username}</div>
                  <div className="text-xs text-gray-400">Nivel {stats?.level} • {stats?.chcoins} Chcoins</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </div>
              
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Torneos Jugados</div>
            <div className="text-3xl font-bold text-white">{stats?.totalTournaments || 0}</div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Victorias</div>
            <div className="text-3xl font-bold text-green-400">{stats?.wins || 0}</div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">Chcoins</div>
            <div className="text-3xl font-bold text-yellow-400">{stats?.chcoins || 0}</div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2">XP Total</div>
            <div className="text-3xl font-bold text-purple-400">{stats?.xp || 0}</div>
          </div>
        </div>

        {/* Active Tournaments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Torneos Activos</h2>
            <Link href="/tournaments" className="text-purple-400 hover:text-purple-300">
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.filter(t => t.status === 'upcoming').slice(0, 3).map((tournament) => (
              <div key={tournament.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{getGameIcon(tournament.game)}</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                      {tournament.status === 'upcoming' ? 'Próximamente' : tournament.status === 'ongoing' ? 'En Curso' : 'Finalizado'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{tournament.name}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-400 text-sm">
                      <span className="mr-2">🎮</span>
                      {tournament.game.replace('-', ' ').toUpperCase()}
                    </div>
                    <div className="flex items-center text-yellow-400 text-sm font-semibold">
                      <span className="mr-2">💰</span>
                      ${tournament.prizePool} USD
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <span className="mr-2">👥</span>
                      {tournament.participants}/{tournament.maxParticipants} participantes
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Inicio: {new Date(tournament.startDate).toLocaleDateString()}
                  </div>

                  {tournament.status === 'upcoming' && tournament.participants < tournament.maxParticipants && (
                    <button
                      onClick={() => handleJoinTournament(tournament.id)}
                      className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200"
                    >
                      Inscribirse Ahora
                    </button>
                  )}

                  {tournament.participants >= tournament.maxParticipants && (
                    <button disabled className="w-full py-3 px-4 bg-gray-700 text-gray-400 font-semibold rounded-lg cursor-not-allowed">
                      Completo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/store" className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30 hover:border-purple-500 transition-all duration-200">
            <div className="text-3xl mb-3">🛒</div>
            <h3 className="text-xl font-bold text-white mb-2">Tienda</h3>
            <p className="text-gray-400 text-sm">Compra productos con Chcoins o USD</p>
          </Link>

          <Link href="/leaderboard" className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-xl p-6 border border-yellow-500/30 hover:border-yellow-500 transition-all duration-200">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="text-xl font-bold text-white mb-2">Ranking</h3>
            <p className="text-gray-400 text-sm">Compite por el top global</p>
          </Link>

          <Link href="/profile" className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-6 border border-blue-500/30 hover:border-blue-500 transition-all duration-200">
            <div className="text-3xl mb-3">👤</div>
            <h3 className="text-xl font-bold text-white mb-2">Perfil</h3>
            <p className="text-gray-400 text-sm">Gestiona tu cuenta y preferencias</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
