import { useEffect, useRef } from 'react';
import './RadarBackdrop.css';

// Pontinhos que "acendem" quando o feixe passa: os clientes no radar
const BLIPS = [
  { top: '22%', left: '64%', delay: '0.4s' },
  { top: '38%', left: '78%', delay: '0.9s' },
  { top: '70%', left: '70%', delay: '2.1s' },
  { top: '76%', left: '36%', delay: '3.3s' },
  { top: '48%', left: '18%', delay: '4.2s' },
  { top: '26%', left: '30%', delay: '5.3s' },
];

// Fundo da tela de entrada: um radar girando que acompanha o mouse de leve
export function RadarBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;

    // Mexe o radar alguns pixels na direção do mouse (efeito de profundidade)
    function handleMove(event: MouseEvent) {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      ref.current?.style.setProperty('--radar-x', `${x * 40}px`);
      ref.current?.style.setProperty('--radar-y', `${y * 40}px`);
    }

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div ref={ref} className="radar-backdrop" aria-hidden="true">
      <div className="radar-disc">
        <div className="radar-sweep" />
        {BLIPS.map((blip, index) => (
          <span
            key={index}
            className="radar-blip"
            style={{
              top: blip.top,
              left: blip.left,
              animationDelay: blip.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}
