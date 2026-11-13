import './CompanySearch.css';

type CompanySearchProps = {
  value: string;
  onChange: (value: string) => void;
};

// Campo para achar uma empresa rápido na tabela
export function CompanySearch({ value, onChange }: CompanySearchProps) {
  return (
    <div className="company-search">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={value}
        placeholder="Buscar empresa"
        aria-label="Buscar empresa"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onChange('');
        }}
      />
      {value && (
        <button
          type="button"
          aria-label="Limpar busca"
          title="Limpar busca"
          onClick={() => onChange('')}
        >
          ×
        </button>
      )}
    </div>
  );
}
