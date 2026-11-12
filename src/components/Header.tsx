import './Header.css';

type HeaderProps = {
  batchName: string;
  total: number;
  onImportClick: () => void;
};

export function Header({ batchName, total, onImportClick }: HeaderProps) {
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
          </p>
        </div>
      </div>

      <button type="button" className="header-button" onClick={onImportClick}>
        Importar planilhas
      </button>
    </header>
  );
}
