import { useState, type KeyboardEvent } from 'react';
import './EditableCell.css';

type EditableCellProps = {
  value: string;
  label: string;
  placeholder: string;
  autoFocus?: boolean;
  onCommit: (value: string) => void;
};

// Texto que parece normal, mas vira campo ao clicar.
// Salva ao sair do campo ou apertar Enter. Esc desfaz.
export function EditableCell({
  value,
  label,
  placeholder,
  autoFocus,
  onCommit,
}: EditableCellProps) {
  const [draft, setDraft] = useState(value);
  const [lastValue, setLastValue] = useState(value);

  // Se o valor mudar por fora (ex: reimportação), atualiza o rascunho
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }

  function commit() {
    const clean = draft.trim();
    if (clean !== value) onCommit(clean);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') event.currentTarget.blur();
    if (event.key === 'Escape') {
      setDraft(value);
      // Espera o rascunho voltar antes de sair do campo
      requestAnimationFrame(() => event.currentTarget?.blur());
    }
  }

  return (
    <input
      className="editable-cell"
      value={draft}
      placeholder={placeholder}
      aria-label={label}
      autoFocus={autoFocus}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
    />
  );
}
