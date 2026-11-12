import { currentMonth } from '../utils/date.ts';
import './Header.css';

type HeaderProps = {
  batchName: string;
  total: number;
  inReview: number;
  onImportClick: () => void;
  onClearClick: () => void;
  onPdfClick: () => void;
  isExporting: boolean;
};

export function Header({
  batchName,
  total,
  inReview,
  onImportClick,
  onClearClick,
  onPdfClick,
  isExporting,
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
          <div className="header-month-row">
            <p className="header-month">{currentMonth()}</p>
            <button
              type="button"
              className="header-pdf"
              disabled={isExporting}
              onClick={onPdfClick}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
              </svg>
              {isExporting ? 'Gerando...' : 'Baixar PDF'}
            </button>
          </div>
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
