import { STATUS_INFO, STATUS_ORDER } from '../status.ts';
import type { Status } from '../types.ts';
import './StatusFilter.css';

// "all" mostra todos os clientes
export type Filter = Status | 'all';

type StatusFilterProps = {
  value: Filter;
  counts: Record<Status, number>;
  total: number;
  onChange: (filter: Filter) => void;
};

// Nomes curtos para caber nos botões
const SHORT_LABELS: Record<Status, string> = {
  not_tried: 'Não tentou',
  tried: 'Sem sucesso',
  scheduled: 'Agendada',
  done: 'Realizada',
  opted_out: 'Não quer contato',
};

export function StatusFilter({
  value,
  counts,
  total,
  onChange,
}: StatusFilterProps) {
  return (
    <div className="status-filter" role="group" aria-label="Filtrar por status">
      <button
        type="button"
        className="status-filter-chip"
        aria-pressed={value === 'all'}
        onClick={() => onChange('all')}
      >
        Todos {total}
      </button>

      {STATUS_ORDER.map((status) => (
        <button
          key={status}
          type="button"
          className="status-filter-chip"
          aria-pressed={value === status}
          onClick={() => onChange(status)}
        >
          <i style={{ background: STATUS_INFO[status].dot }} />
          {SHORT_LABELS[status]} {counts[status]}
        </button>
      ))}
    </div>
  );
}
