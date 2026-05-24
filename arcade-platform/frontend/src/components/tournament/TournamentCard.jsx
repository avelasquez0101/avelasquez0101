import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusColors = {
  UPCOMING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CHECK_IN: 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  COMPLETED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels = {
  UPCOMING: 'Próximo',
  CHECK_IN: 'Check-in Abierto',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

export default function TournamentCard({ tournament }) {
  const { id, name, game, format, status, startDate, prizePool, registrations, _count } = tournament;
  
  const participantCount = _count?.registrations || registrations?.length || 0;
  const isFull = tournament.maxParticipants && participantCount >= tournament.maxParticipants;
  
  return (
    <div className="bg-arcade-surface rounded-xl border border-gray-800 overflow-hidden hover:border-arcade-primary transition-all duration-300 group">
      {/* Header con imagen del juego */}
      <div className="h-32 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-4 left-4 z-10">
          <span className="text-xs font-bold text-white bg-black/60 px-2 py-1 rounded uppercase">
            {game}
          </span>
        </div>
        
        {/* Status badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>
      </div>
      
      {/* Contenido */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-arcade-primary transition">
            {name}
          </h3>
          <p className="text-sm text-gray-400">
            Formato: {format === 'SINGLE_ELIMINATION' ? 'Eliminación Directa' : 'Round Robin'}
          </p>
        </div>
        
        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Premio</p>
            <p className="text-arcade-primary font-bold">{prizePool} 🎮</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">Participantes</p>
            <p className="text-white font-bold">
              {participantCount}/{tournament.maxParticipants || '∞'}
            </p>
          </div>
        </div>
        
        {/* Fecha */}
        <div className="flex items-center text-sm text-gray-400">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {format(new Date(startDate), "dd 'de' MMMM, yyyy HH:mm", { locale: es })}
        </div>
        
        {/* Botón de acción */}
        <Link
          to={`/tournaments/${id}`}
          className={`block w-full text-center py-2.5 rounded-lg font-medium transition ${
            status === 'CHECK_IN' 
              ? 'bg-green-600 hover:bg-green-500 text-white' 
              : isFull
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-arcade-primary hover:bg-indigo-500 text-white'
          }`}
        >
          {isFull ? 'Torneo Lleno' : status === 'CHECK_IN' ? 'Hacer Check-in' : 'Ver Detalles'}
        </Link>
      </div>
    </div>
  );
}
