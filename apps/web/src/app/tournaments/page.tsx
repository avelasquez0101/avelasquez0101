'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Tournament {
  id: string;
  name: string;
  game: string;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  startDate: string;
  endDate?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  description: string;
  rules: string[];
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [gameFilter, setGameFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const response = await api.get('/tournaments');
      setTournaments(response.data);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTournament = async (tournamentId: string) => {
    try {
      await api.post(`/tournaments/${tournamentId}/join`);
      alert('¡Te has inscrito exitosamente!');
      loadTournaments();
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
      case 'upcoming': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'ongoing': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'completed': return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const filteredTournaments = tournaments.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (gameFilter !== 'all' && t.game !== gameFilter) return false;
    return true;
  });

  const games = ['all', 'free-fire', 'cod-mobile', 'mobile-legends', 'wild-rift'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-purple-400 text-xl">Cargando torneos...</div>
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
              Torneos
            </Link>
            <Link href="/dashboard" className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Próximos
            </button>
            <button
              onClick={() => setFilter('ongoing')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'ongoing'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              En Curso
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'completed'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Finalizados
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap md:ml-auto">
            {games.map(game => (
              <button
                key={game}
                onClick={() => setGameFilter(game)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  gameFilter === game
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {game === 'all' ? 'Todos' : game.replace('-', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTournaments.map((tournament) => (
            <div key={tournament.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{getGameIcon(tournament.game)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
                      <div className="text-sm text-gray-400">{tournament.game.replace('-', ' ').toUpperCase()}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tournament.status)}`}>
                    {tournament.status === 'upcoming' ? 'Próximamente' : tournament.status === 'ongoing' ? 'En Curso' : 'Finalizado'}
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-4">{tournament.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Premio</div>
                    <div className="text-yellow-400 font-bold text-lg">${tournament.prizePool} USD</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Participantes</div>
                    <div className="text-white font-bold text-lg">{tournament.participants}/{tournament.maxParticipants}</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-400 text-sm">
                    <span className="mr-2">📅</span>
                    Inicio: {new Date(tournament.startDate).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  {tournament.endDate && (
                    <div className="flex items-center text-gray-400 text-sm">
                      <span className="mr-2">🏁</span>
                      Fin: {new Date(tournament.endDate).toLocaleDateString('es-ES')}
                    </div>
                  )}
                </div>

                {tournament.rules && tournament.rules.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">Reglas:</div>
                    <ul className="text-sm text-gray-400 space-y-1">
                      {tournament.rules.slice(0, 3).map((rule, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2 text-purple-400">•</span>
                          {rule}
                        </li>
                      ))}
                      {tournament.rules.length > 3 && (
                        <li className="text-purple-400">+{tournament.rules.length - 3} más...</li>
                      )}
                    </ul>
                  </div>
                )}

                {tournament.status === 'upcoming' && tournament.participants < tournament.maxParticipants && (
                  <button
                    onClick={() => handleJoinTournament(tournament.id)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    Inscribirse Ahora
                  </button>
                )}

                {tournament.participants >= tournament.maxParticipants && tournament.status === 'upcoming' && (
                  <button disabled className="w-full py-3 px-4 bg-gray-700 text-gray-400 font-semibold rounded-lg cursor-not-allowed">
                    Completo - Lista de Espera
                  </button>
                )}

                {tournament.status === 'ongoing' && (
                  <button disabled className="w-full py-3 px-4 bg-green-600/20 text-green-400 font-semibold rounded-lg cursor-not-allowed border border-green-500/30">
                    Torneo en Progreso
                  </button>
                )}

                {tournament.status === 'completed' && (
                  <button className="w-full py-3 px-4 bg-gray-700 text-gray-400 font-semibold rounded-lg">
                    Ver Resultados
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTournaments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-gray-400">No hay torneos disponibles con estos filtros</p>
          </div>
        )}
      </main>
    </div>
  );
}
