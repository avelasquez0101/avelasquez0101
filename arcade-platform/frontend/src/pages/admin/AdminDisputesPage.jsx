import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin.api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      const response = await adminApi.getDisputes();
      setDisputes(response.data);
    } catch (error) {
      toast.error('Error cargando disputas');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (disputeId, winnerId) => {
    setResolvingId(disputeId);
    try {
      await adminApi.resolveDispute(disputeId, { 
        winnerId, 
        resolution: winnerId ? 'ADMIN_DECISION' : 'MATCH_REPLAY' 
      });
      toast.success('Disputa resuelta correctamente');
      loadDisputes();
    } catch (error) {
      toast.error('Error al resolver disputa');
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestión de Disputas</h1>
        <button 
          onClick={loadDisputes}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition"
        >
          Actualizar
        </button>
      </div>
      
      {disputes.length === 0 ? (
        <div className="bg-arcade-surface p-12 rounded-xl border border-gray-800 text-center">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400 text-lg">No hay disputas pendientes. ¡Todo tranquilo!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div key={dispute.id} className="bg-arcade-surface p-6 rounded-xl border border-red-900/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Match ID: {dispute.matchId || dispute.id}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Torneo: {dispute.tournamentName || 'Desconocido'}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-gray-300">
                      Jugador 1: <span className="text-white font-medium">{dispute.player1Name || 'P1'}</span>
                    </span>
                    <span className="text-gray-300">
                      Jugador 2: <span className="text-white font-medium">{dispute.player2Name || 'P2'}</span>
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                      Reportado por: {dispute.reportedBy?.slice(0, 8) || 'Usuario'}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                      Razón: {dispute.reason || 'Sin especificar'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[200px]">
                  <button
                    onClick={() => handleResolve(dispute.id, dispute.player1Id)}
                    disabled={resolvingId === dispute.id}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ganador: {dispute.player1Name || 'P1'}
                  </button>
                  <button
                    onClick={() => handleResolve(dispute.id, dispute.player2Id)}
                    disabled={resolvingId === dispute.id}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ganador: {dispute.player2Name || 'P2'}
                  </button>
                  <button
                    onClick={() => handleResolve(dispute.id, null)}
                    disabled={resolvingId === dispute.id}
                    className="px-4 py-2 bg-red-900/50 hover:bg-red-900 text-red-200 text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anular / Repetir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
