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

// Mostra a etiqueta só no site de atualização, para não confundir com o original
const IS_TEST_SITE = window.location.hostname.includes('atualizacao')

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
        {/* Logo e nome lado a lado, como uma marca só */}
        <div className="header-lockup">
          {/* Logo do radar: os círculos são o alcance e o ponto é o cliente encontrado */}
          <svg
            className="header-logo"
            viewBox="0 0 120 120"
            aria-hidden="true"
          >
            <rect width="120" height="120" rx="28" fill="#0e6b57" />
            <circle cx="60" cy="60" r="40" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="5" />
            <circle cx="60" cy="60" r="24" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="5" />
            <path d="M60 60 L60 20 A40 40 0 0 1 94.64 40 Z" fill="#fff" fillOpacity="0.22" />
            <path d="M60 60 L60 20" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
            <circle cx="74" cy="37" r="9" fill="#9ff0c9" />
            <circle cx="60" cy="60" r="6" fill="#fff" />
          </svg>
          <h1 className="header-title">Radar CS</h1>
          {IS_TEST_SITE && <span className="header-test-tag">Versão de teste</span>}
        </div>
        <div className="header-info">
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
