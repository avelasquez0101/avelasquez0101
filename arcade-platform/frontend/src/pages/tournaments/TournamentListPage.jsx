import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tournamentsApi } from '../../api/tournaments.api';
import TournamentCard from '../../components/tournament/TournamentCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'UPCOMING', label: 'Próximos' },
  { value: 'CHECK_IN', label: 'Check-in Abierto' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'COMPLETED', label: 'Completados' },
];

const gameOptions = [
  { value: '', label: 'Todos los Juegos' },
  { value: 'Valorant', label: 'Valorant' },
  { value: 'League of Legends', label: 'League of Legends' },
  { value: 'CS:GO', label: 'CS:GO' },
  { value: 'FIFA 24', label: 'FIFA 24' },
  { value: 'Rocket League', label: 'Rocket League' },
];

export default function TournamentListPage() {
  const [filters, setFilters] = useState({
    status: '',
    game: '',
  });

  const { data: tournaments, isLoading, error } = useQuery({
    queryKey: ['tournaments', filters],
    queryFn: () => tournamentsApi.getAll(filters),
    refetchInterval: 10000, // Refrescar cada 10 segundos
  });

  const filteredTournaments = tournaments?.filter(t => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.game && t.game !== filters.game) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Torneos Disponibles</h1>
          <p className="text-gray-400 mt-1">Encuentra tu próxima competición</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-arcade-surface rounded-xl border border-gray-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-arcade-primary"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Juego
            </label>
            <select
              value={filters.game}
              onChange={(e) => setFilters({ ...filters, game: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-arcade-primary"
            >
              {gameOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Torneos */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-400">Error al cargar torneos</p>
          <p className="text-red-300 text-sm mt-2">{error.message}</p>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="bg-arcade-surface rounded-xl border border-gray-800 p-12 text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">No hay torneos disponibles</h3>
          <p className="text-gray-400">Intenta ajustar los filtros o vuelve más tarde</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}
    </div>
  );
}
