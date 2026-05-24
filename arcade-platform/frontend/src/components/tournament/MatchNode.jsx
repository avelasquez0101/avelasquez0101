import { useState } from 'react';
import ReportScoreModal from './ReportScoreModal';

export default function MatchNode({ match, isElimination = false }) {
  const [showReportModal, setShowReportModal] = useState(false);
  
  const { 
    id, player1Id, player2Id, 
    player1Name, player2Name,
    player1Score, player2Score,
    winnerId, status 
  } = match;

  const isCompleted = status === 'COMPLETED';
  const isPending = status === 'PENDING';
  const isDisputed = status === 'DISPUTED';
  
  // Determinar si el usuario actual puede reportar
  const canReport = !isCompleted && !isDisputed && player2Id;

  return (
    <>
      <div className={`relative bg-arcade-surface rounded-lg border-2 overflow-hidden w-64 shadow-lg ${
        isElimination ? 'border-yellow-500/50 shadow-yellow-500/20' :
        isDisputed ? 'border-red-500/50' :
        isCompleted ? 'border-green-500/30' : 'border-gray-700'
      }`}>
        
        {/* Indicador de estado */}
        {isDisputed && (
          <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded-bl">
            DISPUTA
          </div>
        )}
        
        {/* Jugador 1 */}
        <div className={`flex justify-between items-center p-3 ${
          winnerId === player1Id ? 'bg-green-900/30' : ''
        }`}>
          <div className="flex items-center space-x-2">
            {winnerId === player1Id && (
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span className={`font-medium text-sm ${
              winnerId === player1Id ? 'text-green-400' : 'text-white'
            }`}>
              {player1Name || 'Jugador 1'}
            </span>
          </div>
          <span className={`text-lg font-bold ${
            winnerId === player1Id ? 'text-green-400' : 'text-gray-400'
          }`}>
            {player1Score ?? '-'}
          </span>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-gray-700 mx-3"></div>
        
        {/* Jugador 2 */}
        <div className={`flex justify-between items-center p-3 ${
          winnerId === player2Id ? 'bg-green-900/30' : ''
        }`}>
          <div className="flex items-center space-x-2">
            {winnerId === player2Id && (
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span className={`font-medium text-sm ${
              winnerId === player2Id ? 'text-green-400' : 'text-white'
            }`}>
              {player2Name || 'Esperando...'}
            </span>
          </div>
          <span className={`text-lg font-bold ${
            winnerId === player2Id ? 'text-green-400' : 'text-gray-400'
          }`}>
            {player2Score ?? '-'}
          </span>
        </div>
        
        {/* Botón de reportar (solo si es tu partida) */}
        {canReport && (
          <div className="p-2 bg-gray-900/50">
            <button
              onClick={() => setShowReportModal(true)}
              className="w-full bg-arcade-primary hover:bg-indigo-500 text-white text-xs py-2 rounded transition"
            >
              Reportar Resultado
            </button>
          </div>
        )}
        
        {/* Conector visual para siguiente ronda */}
        <div className="absolute -right-4 top-1/2 w-4 h-px bg-gray-600"></div>
      </div>

      {/* Modal para reportar resultado */}
      {showReportModal && (
        <ReportScoreModal
          matchId={id}
          player1Id={player1Id}
          player2Id={player2Id}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </>
  );
}
