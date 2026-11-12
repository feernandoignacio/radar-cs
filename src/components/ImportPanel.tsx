import { useEffect, useState } from 'react';
import type { Client } from '../types.ts';
import {
  buildClients,
  detectFileKind,
  type FileKind,
} from '../utils/importBatch.ts';
import { readSpreadsheet, type SheetRow } from '../utils/readSpreadsheet.ts';
import './ImportPanel.css';

type LoadedFile = { name: string; rows: SheetRow[] };

type ImportPanelProps = {
  previous: Client[];
  removedIds: string[];
  hasSavedBatch: boolean;
  onClose: () => void;
  onImport: (clients: Client[], keepStatus: boolean) => void;
};

const FILE_LABELS: Record<FileKind, { title: string; hint: string }> = {
  batch: {
    title: 'Lote do mês',
    hint: 'Visão Company CTA (obrigatório)',
  },
  reasons: {
    title: 'Motivos',
    hint: 'CTA Export',
  },
  contacts: {
    title: 'Contatos',
    hint: 'E-mails da Base',
  },
};

const KINDS: FileKind[] = ['batch', 'reasons', 'contacts'];

export function ImportPanel({
  previous,
  removedIds,
  hasSavedBatch,
  onClose,
  onImport,
}: ImportPanelProps) {
  const [files, setFiles] = useState<Partial<Record<FileKind, LoadedFile>>>({});
  const [unknownFiles, setUnknownFiles] = useState<string[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [keepStatus, setKeepStatus] = useState(hasSavedBatch);
  const [importError, setImportError] = useState('');

  // Fecha com Esc
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setIsReading(true);
    const unknown: string[] = [];
    const found: Partial<Record<FileKind, LoadedFile>> = {};

    for (const file of Array.from(list)) {
      try {
        const rows = await readSpreadsheet(file);
        const kind = detectFileKind(rows);
        if (kind) {
          found[kind] = { name: file.name, rows };
        } else {
          unknown.push(file.name);
        }
      } catch {
        unknown.push(file.name);
      }
    }

    setFiles((prev) => ({ ...prev, ...found }));
    setImportError('');
    setUnknownFiles(unknown);
    setIsReading(false);
  }

  function handleImport() {
    if (!files.batch) return;
    const clients = buildClients({
      batch: files.batch.rows,
      reasons: files.reasons?.rows ?? [],
      contacts: files.contacts?.rows ?? [],
      previous,
      removedIds,
      keepStatus,
    });
    // Não troca o lote atual por um vazio
    if (clients.length === 0) {
      setImportError(
        'Não encontrei nenhuma empresa no lote. Confira se é o arquivo certo.',
      );
      return;
    }
    onImport(clients, keepStatus);
  }

  return (
    <div className="import-overlay" onClick={onClose}>
      <div
        className="import-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="import-header">
          <h2 id="import-title">Importar planilhas</h2>
          <button
            type="button"
            className="import-close"
            aria-label="Fechar"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <p className="import-text">
          Selecione as 3 planilhas de uma vez (CSV ou Excel). O app descobre
          qual é qual e junta tudo pelo nome da empresa. Os arquivos são lidos
          aqui no navegador e não saem do seu computador.
        </p>

        <label className="import-drop">
          <input
            type="file"
            accept=".csv,.xlsx"
            multiple
            onChange={(event) => handleFiles(event.target.files)}
          />
          <strong>
            {isReading ? 'Lendo arquivos...' : 'Escolher arquivos'}
          </strong>
          <span>ou arraste para cá</span>
        </label>

        <ul className="import-list">
          {KINDS.map((kind) => (
            <li key={kind} className={files[kind] ? 'is-ok' : undefined}>
              <span className="import-check" aria-hidden="true">
                {files[kind] ? '✓' : ''}
              </span>
              <span className="import-item">
                <strong>{FILE_LABELS[kind].title}</strong>
                <small>{files[kind]?.name ?? FILE_LABELS[kind].hint}</small>
              </span>
            </li>
          ))}
        </ul>

        {unknownFiles.length > 0 && (
          <p className="import-error" role="alert">
            Não reconheci: {unknownFiles.join(', ')}
          </p>
        )}

        {importError && (
          <p className="import-error" role="alert">
            {importError}
          </p>
        )}

        {hasSavedBatch && (
          <fieldset className="import-mode">
            <legend>O que fazer com os status?</legend>
            <label>
              <input
                type="radio"
                name="mode"
                checked={keepStatus}
                onChange={() => setKeepStatus(true)}
              />
              Atualizar o lote atual (mantém os status)
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                checked={!keepStatus}
                onChange={() => setKeepStatus(false)}
              />
              Novo mês (todos começam em "Não tentou ainda")
            </label>
          </fieldset>
        )}

        <button
          type="button"
          className="import-submit"
          disabled={!files.batch || isReading}
          onClick={handleImport}
        >
          Importar
        </button>
      </div>
    </div>
  );
}
