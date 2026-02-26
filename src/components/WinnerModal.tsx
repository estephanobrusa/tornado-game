import React from 'react';
import '../styles.css';

interface WinnerModalProps {
  winnerResult: {
    winner: string | null;
    isTie: boolean;
    finalScores: Record<string, number>;
    rankings: { position: number; playerId: string; score: number }[];
  } | null;
  onRestart: () => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winnerResult, onRestart }) => {
  if (!winnerResult) return null;

  return (
    <div className="winner-modal-overlay">
      <div className="winner-modal-box">
        <h2>Game Result</h2>
        {winnerResult.isTie ? (
          <h3>It's a tie!</h3>
        ) : (
          <h3>Winner: {winnerResult.winner}</h3>
        )}
        <h4>Final Ranking:</h4>
        <ol className="winner-modal-ranking">
          {winnerResult.rankings.map(r => (
            <li key={r.playerId}>
              {r.position}. {r.playerId} - {r.score} puntos
            </li>
          ))}
        </ol>
        <button onClick={onRestart} className="winner-modal-restart-btn">
          Reiniciar juego
        </button>
      </div>
    </div>
  );
};

export default WinnerModal;
