// Musiquinha curta de comemoração, feita no próprio navegador
// (sem arquivo de áudio): quatro notas subindo, dó-mi-sol-dó.
const NOTES = [523.25, 659.25, 783.99, 1046.5];

export function playCelebrationSound() {
  try {
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const start = ctx.currentTime;

    NOTES.forEach((frequency, index) => {
      const isLast = index === NOTES.length - 1;
      const at = start + index * 0.12;
      const length = isLast ? 0.6 : 0.16;

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;

      // Volume baixo, com começo e fim suaves para não estalar
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.12, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, at + length);

      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(at);
      oscillator.stop(at + length + 0.05);
    });

    // Fecha o áudio quando a música acaba
    window.setTimeout(() => void ctx.close(), 1500);
  } catch {
    // Navegador sem áudio: comemora só na tela
  }
}
