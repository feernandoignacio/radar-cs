import type { Batch } from '../types.ts';
import { DEFAULT_SETTINGS, type MessageSettings } from './message.ts';

// O "v1" deixa trocar o formato no futuro sem quebrar dados antigos
const STORAGE_KEY = 'radar-cs:batch:v1';
const SETTINGS_KEY = 'radar-cs:settings:v1';
const NOTES_KEY = 'radar-cs:notes:v1';
const CELEBRATED_KEY = 'radar-cs:celebrated:v1';

// Cada carteira guarda os dados à parte. "me" é a carteira da própria
// pessoa e usa as chaves de sempre, então os dados antigos continuam valendo.
export type Scope = string;

function scoped(key: string, scope: Scope) {
  return scope === 'me' ? key : key.replace('radar-cs:', `radar-cs:${scope}:`);
}

// Os dados ficam só no navegador dela. Nada vai para servidor.
export function loadBatch(scope: Scope = 'me'): Batch | null {
  try {
    const saved = localStorage.getItem(scoped(STORAGE_KEY, scope));
    return saved ? (JSON.parse(saved) as Batch) : null;
  } catch {
    return null;
  }
}

export function saveBatch(batch: Batch, scope: Scope = 'me') {
  try {
    localStorage.setItem(scoped(STORAGE_KEY, scope), JSON.stringify(batch));
  } catch {
    // Navegador sem espaço ou em modo privado: segue sem salvar
  }
}

// Modelo da mensagem, nome e link da agenda ficam salvos à parte do lote
export function loadSettings(): MessageSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved
      ? { ...DEFAULT_SETTINGS, ...(JSON.parse(saved) as MessageSettings) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: MessageSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Segue sem salvar
  }
}

// Anotações livres (estratégia da semana, lembretes)
export function loadNotes(scope: Scope = 'me'): string {
  try {
    return localStorage.getItem(scoped(NOTES_KEY, scope)) ?? '';
  } catch {
    return '';
  }
}

export function saveNotes(notes: string, scope: Scope = 'me') {
  try {
    localStorage.setItem(scoped(NOTES_KEY, scope), notes);
  } catch {
    // Segue sem salvar
  }
}

// Lote em que a meta já foi comemorada, para a festa aparecer uma vez só
export function loadCelebrated(scope: Scope = 'me'): string {
  try {
    return localStorage.getItem(scoped(CELEBRATED_KEY, scope)) ?? '';
  } catch {
    return '';
  }
}

export function saveCelebrated(batchKey: string, scope: Scope = 'me') {
  try {
    localStorage.setItem(scoped(CELEBRATED_KEY, scope), batchKey);
  } catch {
    // Segue sem salvar
  }
}

// Tudo o que o app guarda, usado pelo backup
export const ALL_KEYS = [STORAGE_KEY, SETTINGS_KEY, NOTES_KEY, CELEBRATED_KEY];

// Botão "Apagar dados": tira tudo deste navegador
export function clearAll() {
  try {
    for (const key of ALL_KEYS) localStorage.removeItem(key);
  } catch {
    // Nada a fazer
  }
}
