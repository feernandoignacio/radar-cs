import type { Batch } from '../types.ts';

// O "v1" deixa trocar o formato no futuro sem quebrar dados antigos
const STORAGE_KEY = 'radar-cs:batch:v1';

// Os dados ficam só no navegador dela. Nada vai para servidor.
export function loadBatch(): Batch | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Batch) : null;
  } catch {
    return null;
  }
}

export function saveBatch(batch: Batch) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(batch));
  } catch {
    // Navegador sem espaço ou em modo privado: segue sem salvar
  }
}
