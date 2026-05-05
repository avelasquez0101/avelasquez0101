'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  xp: number;
  level: number;
  wins: number;
  tournamentsPlayed: number;
  winRate: number;
  badge?: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [gameFilter, setGameFilter] = useState<string>('global');
  const [timeFilter, setTimeFilter] = useState<string>('all-time');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [gameFilter, timeFilter]);

  const loadLeaderboard = async () => {
    try {
      const response = await api.get('/leaderboard', {
        params: { game: gameFilter, period: timeFilter }
      });
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getLevelBadge = (level: number) => {
    if (level >= 50) return '👑';
    if (level >= 30) return '⭐';
    if (level >= 10) return '🎖️';
    return '🎮';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-purple-400 text-xl">Cargando ranking...</div>
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
              Ranking Global
            </Link>
            <Link href="/dashboard" className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white text-center mb-8">🏆 Top 3 Jugadores</h2>
            <div className="grid grid-cols-3 gap-4 items-end">
              {/* Second Place */}
              <div className="text-center">
                <div className="text-6xl mb-2">{getRankBadge(2)}</div>
                <div className="text-4xl mb-2">{getLevelBadge(leaderboard[1].level)}</div>
                <div className="text-white font-bold text-lg truncate">{leaderboard[1].username}</div>
                <div className="text-gray-400 text-sm">Nivel {leaderboard[1].level}</div>
                <div className="text-yellow-400 font-semibold">{leaderboard[1].xp} XP</div>
                <div className="text-xs text-gray-500 mt-2">{leaderboard[1].wins}W / {leaderboard[1].winRate}% WR</div>
              </div>

              {/* First Place */}
              <div className="text-center">
                <div className="text-7xl mb-2">{getRankBadge(1)}</div>
                <div className="text-5xl mb-2">{getLevelBadge(leaderboard[0].level)}</div>
                <div className="text-white font-bold text-xl truncate">{leaderboard[0].username}</div>
                <div className="text-gray-400 text-sm">Nivel {leaderboard[0].level}</div>
                <div className="text-yellow-400 font-semibold text-lg">{leaderboard[0].xp} XP</div>
                <div className="text-xs text-gray-500 mt-2">{leaderboard[0].wins}W / {leaderboard[0].winRate}% WR</div>
              </div>

              {/* Third Place */}
              <div className="text-center">
                <div className="text-6xl mb-2">{getRankBadge(3)}</div>
                <div className="text-4xl mb-2">{getLevelBadge(leaderboard[2].level)}</div>
                <div className="text-white font-bold text-lg truncate">{leaderboard[2].username}</div>
                <div className="text-gray-400 text-sm">Nivel {leaderboard[2].level}</div>
                <div className="text-yellow-400 font-semibold">{leaderboard[2].xp} XP</div>
                <div className="text-xs text-gray-500 mt-2">{leaderboard[2].wins}W / {leaderboard[2].winRate}% WR</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-400 text-sm mr-2">Juego:</span>
            {['global', 'free-fire', 'cod-mobile', 'mobile-legends', 'wild-rift'].map(game => (
              <button
                key={game}
                onClick={() => setGameFilter(game)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  gameFilter === game
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {game === 'global' ? 'Global' : game.replace('-', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap md:ml-auto">
            <span className="text-gray-400 text-sm mr-2">Período:</span>
            <button
              onClick={() => setTimeFilter('weekly')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeFilter === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setTimeFilter('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeFilter === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setTimeFilter('all-time')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeFilter === 'all-time'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Todo el Tiempo
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Jugador
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    XP Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Victorias
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Torneos
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Win Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {leaderboard.map((entry, index) => (
                  <tr 
                    key={entry.userId} 
                    className={`hover:bg-gray-700/30 transition-colors ${
                      index < 3 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-2xl">{getRankBadge(index + 1)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mr-3">
                          {entry.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{entry.username}</div>
                          {entry.badge && (
                            <div className="text-xs text-purple-400">{entry.badge}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="mr-2">{getLevelBadge(entry.level)}</span>
                        <span className="text-white">{entry.level}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-yellow-400 font-bold">{entry.xp.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-green-400 font-semibold">{entry.wins}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-300">{entry.tournamentsPlayed}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`font-semibold ${
                        entry.winRate >= 60 ? 'text-green-400' :
                        entry.winRate >= 40 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {entry.winRate}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-gray-400">No hay datos de ranking disponibles</p>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30">
          <h3 className="text-xl font-bold text-white mb-2">📊 ¿Cómo funciona el ranking?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <div className="font-semibold text-purple-400 mb-1">Gana XP</div>
              <div>Participa en torneos y completa desafíos para ganar experiencia</div>
            </div>
            <div>
              <div className="font-semibold text-purple-400 mb-1">Multiplicadores</div>
              <div>Mantén rachas diarias para obtener bonus de XP</div>
            </div>
            <div>
              <div className="font-semibold text-purple-400 mb-1">Sube de Nivel</div>
              <div>Acumula XP para subir de nivel y desbloquear recompensas VIP</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
