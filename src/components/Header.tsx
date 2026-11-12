import './Header.css';

type HeaderProps = {
  batchName: string;
  total: number;
  inReview: number;
  onImportClick: () => void;
  onClearClick: () => void;
};

// "novembro de 2026" -> "Novembro de 2026"
function currentMonth() {
  const text = new Date().toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function Header({
  batchName,
  total,
  inReview,
  onImportClick,
  onClearClick,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-logo" aria-hidden="true">
          RC
        </div>
        <div>
          <h1 className="header-title">Radar CS</h1>
          <p className="header-subtitle">
            {batchName} · {total} clientes prioritários
            {inReview > 0 && ` · ${inReview} em análise`}
          </p>
          <p className="header-month">{currentMonth()}</p>
        </div>
      </div>

      <div className="header-actions">
        <button type="button" className="header-button" onClick={onImportClick}>
          Importar planilhas
        </button>
        <button
          type="button"
          className="header-button header-button-danger"
          onClick={onClearClick}
        >
          Limpar dados
        </button>
      </div>
    </header>
  );
}
