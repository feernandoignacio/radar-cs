import type { Batch } from '../types.ts';
import { ALL_KEYS } from './storage.ts';

// Arquivo de backup: uma cópia de tudo o que está salvo no navegador
type BackupFile = {
  app: 'radar-cs';
  version: 1;
  exportedAt: string;
  data: Record<string, string | null>;
};

export type BackupInfo = {
  file: BackupFile;
  exportedAt: string;
  clients: number;
};

// Baixa o backup como um arquivo .json, sem passar por nenhum servidor
export function downloadBackup() {
  const data: Record<string, string | null> = {};
  for (const key of ALL_KEYS) data[key] = localStorage.getItem(key);

  const backup: BackupFile = {
    app: 'radar-cs',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };

  const blob = new Blob([JSON.stringify(backup)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `radar-cs-backup-${backup.exportedAt.slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Lê o arquivo escolhido e confere se é mesmo um backup do Radar CS
export async function readBackup(file: File): Promise<BackupInfo> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error('Esse arquivo não é um backup do Radar CS.');
  }

  const backup = parsed as Partial<BackupFile>;
  if (backup?.app !== 'radar-cs' || typeof backup.data !== 'object') {
    throw new Error('Esse arquivo não é um backup do Radar CS.');
  }

  const rawBatch = backup.data?.[ALL_KEYS[0]];
  const batch = rawBatch ? (JSON.parse(rawBatch) as Batch) : null;

  return {
    file: backup as BackupFile,
    exportedAt: backup.exportedAt ?? '',
    clients: batch?.clients.length ?? 0,
  };
}

// Troca o que está no navegador pelo conteúdo do backup
export function restoreBackup(backup: BackupFile) {
  for (const key of ALL_KEYS) {
    const value = backup.data[key];
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  }
}
