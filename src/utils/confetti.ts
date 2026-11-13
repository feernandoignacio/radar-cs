export type ConfettiPiece = {
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotate: number;
};

const COLORS = ['#1f9d62', '#e0a21b', '#7c4dd6', '#2f6fdb', '#d93a3a', '#9ff0c9'];

// Sorteia os confetes uma vez, na hora de comemorar
export function makeConfetti(count = 60): ConfettiPiece[] {
  return Array.from({ length: count }, (_, index) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    duration: 1.8 + Math.random() * 1.2,
    color: COLORS[index % COLORS.length],
    rotate: Math.random() * 360,
  }));
}
