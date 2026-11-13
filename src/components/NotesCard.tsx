import { useRef, useState } from 'react';
import { loadNotes, saveNotes, type Scope } from '../utils/storage.ts';
import './NotesCard.css';

// Espaço livre para anotar a estratégia da semana ou o que quiser.
// Salva a cada letra, só neste navegador. Não entra no PDF.
type NotesCardProps = {
  scope: Scope;
  // Colega com "só visualizar" lê as anotações, mas não muda
  readOnly: boolean;
};

export function NotesCard({ scope, readOnly }: NotesCardProps) {
  const [notes, setNotes] = useState(() => loadNotes(scope));
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  function handleChange(value: string) {
    setNotes(value);
    saveNotes(value, scope);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(notes);
      setCopied(true);
      // Volta para o ícone de copiar depois de um tempinho
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Navegador bloqueou a área de transferência: não faz nada
    }
  }

  return (
    <section className="notes-card" aria-labelledby="notes-title">
      <h2 id="notes-title" className="notes-title">
        <label htmlFor="notes-input">Anotações</label>
      </h2>
      <div className="notes-field">
        <textarea
          id="notes-input"
          className="notes-input"
          value={notes}
          readOnly={readOnly}
          placeholder="Estratégia da semana, lembretes, o que quiser anotar."
          onChange={(event) => handleChange(event.target.value)}
        />
        <button
          type="button"
          className={copied ? 'notes-copy is-copied' : 'notes-copy'}
          disabled={!notes.trim()}
          aria-label={copied ? 'Anotações copiadas' : 'Copiar anotações'}
          title={copied ? 'Copiado' : 'Copiar'}
          onClick={handleCopy}
        >
          {copied ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12l5 5 9-10" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V6a2 2 0 0 1 2-2h8" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
}
