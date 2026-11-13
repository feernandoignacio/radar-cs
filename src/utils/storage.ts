import type { Batch } from '../types.ts';
import { DEFAULT_SETTINGS, type MessageSettings } from './message.ts';

// O "v1" deixa trocar o formato no futuro sem quebrar dados antigos
const STORAGE_KEY = 'radar-cs:batch:v1';
const SETTINGS_KEY = 'radar-cs:settings:v1';
const NOTES_KEY = 'radar-cs:notes:v1';

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
export function loadNotes(): string {
  try {
    return localStorage.getItem(NOTES_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveNotes(notes: string) {
  try {
    localStorage.setItem(NOTES_KEY, notes);
  } catch {
    // Segue sem salvar
  }
}

// Botão "Apagar dados": tira tudo deste navegador
export function clearAll() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(NOTES_KEY);
  } catch {
    // Nada a fazer
  }
}
