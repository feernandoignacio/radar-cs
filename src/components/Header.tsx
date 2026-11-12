import './Header.css';

type HeaderProps = {
  batchName: string;
  total: number;
};

export function Header({ batchName, total }: HeaderProps) {
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

      {/* Os botões de importar ganham função na parte 3 */}
      <div className="header-actions">
        <button type="button" className="header-button">
          Importar lote (CSV)
        </button>
        <button type="button" className="header-button">
          Importar contatos
        </button>
      </div>
    </header>
  );
}
