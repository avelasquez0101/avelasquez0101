import { useState, useEffect } from 'react';
import MatchNode from './MatchNode';

export default function BracketView({ matches }) {
  const [rounds, setRounds] = useState([]);

  useEffect(() => {
    if (!matches || matches.length === 0) return;
    
    // Agrupar matches por ronda
    const grouped = matches.reduce((acc, match) => {
      const round = match.round - 1; // 0-indexed
      if (!acc[round]) acc[round] = [];
      acc[round].push(match);
      return acc;
    }, []);
    
    setRounds(grouped);
  }, [matches]);

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">El bracket aún no ha sido generado</p>
        <p className="text-gray-500 text-sm mt-2">El administrador generará el bracket cuando comience el check-in</p>
      </div>
    );
  }

  const totalRounds = rounds.length;
  const finalRoundIndex = totalRounds - 1;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max">
        {rounds.map((roundMatches, roundIndex) => {
          const isFinalRound = roundIndex === finalRoundIndex;
          const roundName = isFinalRound ? 'GRAN FINAL' : `Ronda ${roundIndex + 1}`;
          
          return (
            <div key={roundIndex} className="flex flex-col">
              <h3 className={`text-center font-bold mb-4 ${
                isFinalRound 
                  ? 'text-yellow-400 text-lg' 
                  : 'text-gray-300'
              }`}>
                {roundName}
              </h3>
              
              <div className="flex flex-col justify-around gap-4" style={{ minHeight: `${roundMatches.length * 160}px` }}>
                {roundMatches.map((match) => (
                  <MatchNode 
                    key={match.id} 
                    match={match} 
                    isElimination={isFinalRound && match.status === 'COMPLETED'}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
