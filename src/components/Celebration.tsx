import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ConfettiPiece } from '../utils/confetti.ts';
import './Celebration.css';

type CelebrationProps = {
  confetti: ConfettiPiece[];
  onDone: () => void;
};

// Confetes caindo e um aviso no topo. Some sozinho, sem precisar fechar.
export function Celebration({ confetti, onDone }: CelebrationProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 5000);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return createPortal(
    <div className="celebration">
      <div className="celebration-confetti" aria-hidden="true">
        {confetti.map((piece, index) => (
          <span
            key={index}
            style={{
              left: `${piece.left}%`,
              background: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              rotate: `${piece.rotate}deg`,
            }}
          />
        ))}
      </div>
      <p className="celebration-toast" role="status">
        <strong>Meta do mês batida!</strong>
        <span>Parabéns pelo trabalho.</span>
      </p>
    </div>,
    document.body,
  );
}
