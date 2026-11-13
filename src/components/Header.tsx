import { currentMonth } from '../utils/date.ts';
import { BrandLogo } from './BrandLogo.tsx';
import './Header.css';

type HeaderProps = {
  batchName: string;
  total: number;
  inReview: number;
  onImportClick: () => void;
  onClearClick: () => void;
  onPdfClick: () => void;
  isExporting: boolean;
  // Só a dona da carteira importa, limpa e dá acesso
  isOwner: boolean;
  onShareClick: () => void;
  onSwitchClick: () => void;
};

// Mostra a etiqueta só no site de atualização, para não confundir com o original
const IS_TEST_SITE = window.location.hostname.includes('atualizacao');

export function Header({
  batchName,
  total,
  inReview,
  onImportClick,
  onClearClick,
  onPdfClick,
  isExporting,
  isOwner,
  onShareClick,
  onSwitchClick,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header-brand">
        {/* Logo e nome lado a lado, como uma marca só */}
        <div className="header-lockup">
          <BrandLogo className="header-logo" />
          <h1 className="header-title">Radar CS</h1>
          {IS_TEST_SITE && (
            <span className="header-test-tag">Versão de teste</span>
          )}
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
        <button type="button" className="header-button" onClick={onSwitchClick}>
          Trocar carteira
        </button>
        {isOwner && (
          <>
            <button
              type="button"
              className="header-button"
              onClick={onShareClick}
            >
              Dar acesso
            </button>
            <button
              type="button"
              className="header-button"
              onClick={onImportClick}
            >
              Importar planilhas
            </button>
            <button
              type="button"
              className="header-button header-button-danger"
              onClick={onClearClick}
            >
              Limpar dados
            </button>
          </>
        )}
      </div>
    </header>
  );
}
