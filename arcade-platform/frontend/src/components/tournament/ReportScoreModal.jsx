import { useState } from 'react';
import { tournamentsApi } from '../../api/tournaments.api';
import toast from 'react-hot-toast';

export default function ReportScoreModal({ matchId, player1Id, player2Id, onClose }) {
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!score1 || !score2) {
      toast.error('Ingresa ambos marcadores');
      return;
    }

    const s1 = parseInt(score1);
    const s2 = parseInt(score2);

    if (s1 < 0 || s2 < 0) {
      toast.error('Los marcadores no pueden ser negativos');
      return;
    }

    if (s1 === s2) {
      toast.error('No se permiten empates en este formato');
      return;
    }

    setLoading(true);

    try {
      await tournamentsApi.reportResult(matchId, s1, s2);
      toast.success('Resultado reportado correctamente');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error al reportar resultado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-arcade-surface rounded-xl border border-gray-700 max-w-md w-full p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4">Reportar Resultado</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Jugador 1
              </label>
              <input
                type="number"
                min="0"
                value={score1}
                onChange={(e) => setScore1(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:border-arcade-primary"
                placeholder="0"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Jugador 2
              </label>
              <input
                type="number"
                min="0"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:border-arcade-primary"
                placeholder="0"
              />
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-300">
              ⚠️ Asegúrate de que el marcador sea correcto. Una vez reportado, solo un administrador puede modificarlo.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-arcade-primary hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
