export type ConfettiPiece = {
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotate: number;
};

const COLORS = ['#1f9d62', '#e0a21b', '#7c4dd6', '#2f6fdb', '#d93a3a', '#9ff0c9'];

// Sorteia os confetes uma vez, na hora de comemorar
export function makeConfetti(count = 90): ConfettiPiece[] {
  return Array.from({ length: count }, (_, index) => ({
    left: Math.random() * 100,
    // Saem em ondas durante 1,5s e terminam de cair até os 5s
    delay: Math.random() * 1.5,
    duration: 2.8 + Math.random() * 0.7,
    color: COLORS[index % COLORS.length],
    rotate: Math.random() * 360,
  }));
}
