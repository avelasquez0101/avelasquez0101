import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { tournamentsApi } from '../../api/tournaments.api';
import BracketView from '../../components/tournament/BracketView';
import CheckInButton from '../../components/tournament/CheckInButton';
import ReportScoreModal from '../../components/tournament/ReportScoreModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TournamentDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    loadTournament();
    const interval = setInterval(loadTournament, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const loadTournament = async () => {
    try {
      const { data } = await tournamentsApi.getTournament(id);
      setTournament(data);
    } catch (error) {
      toast.error('Error al cargar el torneo');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para inscribirte');
      return;
    }
    
    setRegistering(true);
    try {
      await tournamentsApi.register(id);
      toast.success('¡Te has inscrito correctamente!');
      loadTournament();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al inscribirse');
    } finally {
      setRegistering(false);
    }
  };

  const handleReportScore = (match) => {
    setSelectedMatch(match);
    setShowReportModal(true);
  };

  if (loading) return <LoadingSpinner />;
  if (!tournament) return <div className="text-center py-20">Torneo no encontrado</div>;

  const statusColors = {
    UPCOMING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    CHECK_IN: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    IN_PROGRESS: 'bg-green-500/20 text-green-400 border-green-500/30',
    COMPLETED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  const statusLabels = {
    UPCOMING: 'Próximamente',
    CHECK_IN: 'Check-in Abierto',
    IN_PROGRESS: 'En Progreso',
    COMPLETED: 'Finalizado',
    CANCELLED: 'Cancelado'
  };

  const myRegistration = tournament.registrations?.find(r => r.userId === user?.id);
  const myMatches = tournament.matches?.filter(m => 
    m.player1Id === user?.id || m.player2Id === user?.id
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header del Torneo */}
      <div className="bg-arcade-surface p-6 rounded-xl border border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{tournament.name}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[tournament.status]}`}>
                {statusLabels[tournament.status]}
              </span>
              <span className="text-gray-400 text-sm">{tournament.game}</span>
              <span className="text-gray-400 text-sm">•</span>
              <span className="text-gray-400 text-sm capitalize">
                {tournament.format === 'SINGLE_ELIMINATION' ? 'Eliminación Directa' : 'Round Robin'}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-arcade-primary">{tournament.prizePool}</div>
            <div className="text-sm text-gray-400">Créditos Arcade</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-400">Inicio</div>
            <div className="text-white font-medium">
              {new Date(tournament.startDate).toLocaleDateString('es-ES', { 
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
              })}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Participantes</div>
            <div className="text-white font-medium">
              {tournament._count?.registrations || tournament.registrations?.length || 0} / {tournament.maxParticipants}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Ronda Actual</div>
            <div className="text-white font-medium">
              {tournament.currentRound > 0 ? `Ronda ${tournament.currentRound}` : 'No iniciada'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Creado</div>
            <div className="text-white font-medium">
              {formatDistanceToNow(new Date(tournament.createdAt), { addSuffix: true, locale: es })}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 flex-wrap">
          {!myRegistration && tournament.status === 'UPCOMING' ? (
            <button
              onClick={handleRegister}
              disabled={registering || (tournament._count?.registrations || 0) >= tournament.maxParticipants}
              className="px-6 py-2 bg-arcade-primary hover:bg-indigo-500 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registering ? 'Inscribiendo...' : 'Inscribirse al Torneo'}
            </button>
          ) : myRegistration ? (
            tournament.status === 'CHECK_IN' && !myRegistration.checkedIn && (
              <CheckInButton tournamentId={id} onCheckInComplete={loadTournament} />
            )
          ) : null}

          {myRegistration && myRegistration.checkedIn && (
            <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
              ✓ Check-in Realizado
            </span>
          )}
        </div>
      </div>

      {/* Mis Partidas - Solo si el torneo está en progreso */}
      {tournament.status === 'IN_PROGRESS' && myMatches.length > 0 && (
        <div className="bg-arcade-surface p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Mis Partidas</h2>
          <div className="space-y-3">
            {myMatches.map(match => (
              <div key={match.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex-1">
                  <div className="text-white font-medium">
                    {match.player1Id === user?.id ? 'Tú' : 'Oponente'} vs {match.player2Id === user?.id ? 'Tú' : 'Oponente'}
                  </div>
                  <div className="text-sm text-gray-400">
                    Ronda {match.round} • {match.status === 'PENDING' ? 'Pendiente' : match.status === 'COMPLETED' ? 'Finalizada' : 'En disputa'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {match.status === 'PENDING' && (match.player1Id === user?.id || match.player2Id === user?.id) && (
                    <button
                      onClick={() => handleReportScore(match)}
                      className="px-4 py-2 bg-arcade-primary hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition"
                    >
                      Reportar Resultado
                    </button>
                  )}
                  {match.status === 'COMPLETED' && (
                    <div className="text-lg font-bold text-white">
                      {match.player1Score} - {match.player2Score}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bracket del Torneo */}
      {tournament.status !== 'UPCOMING' && tournament.matches && tournament.matches.length > 0 ? (
        <div className="bg-arcade-surface p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Bracket en Vivo</h2>
          <BracketView 
            matches={tournament.matches} 
            currentUserId={user?.id}
            onReportScore={handleReportScore}
          />
        </div>
      ) : tournament.status !== 'UPCOMING' ? (
        <div className="bg-arcade-surface p-12 rounded-xl border border-gray-800 text-center">
          <p className="text-gray-400">El bracket se generará cuando comience el torneo</p>
        </div>
      ) : null}

      {/* Lista de Participantes */}
      <div className="bg-arcade-surface p-6 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">
          Participantes ({tournament._count?.registrations || tournament.registrations?.length || 0})
        </h2>
        {tournament.registrations && tournament.registrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tournament.registrations.map((reg, index) => (
              <div 
                key={reg.id} 
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  reg.userId === user?.id ? 'bg-arcade-primary/20 border border-arcade-primary/30' : 'bg-gray-800/50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-arcade-primary flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">Jugador {reg.userId.slice(0, 8)}</div>
                  {reg.checkedIn && <span className="text-xs text-green-400">✓ Check-in</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">Aún no hay participantes</p>
        )}
      </div>

      {/* Modal para Reportar Resultado */}
      {showReportModal && selectedMatch && (
        <ReportScoreModal
          match={selectedMatch}
          onClose={() => {
            setShowReportModal(false);
            setSelectedMatch(null);
            loadTournament();
          }}
        />
      )}
    </div>
  );
}
