import { STATUS_INFO } from '../status.ts';
import { percent, type Summary } from '../utils/summary.ts';
import type { Status } from '../types.ts';
import './StatusCards.css';

type StatusCardsProps = {
  summary: Summary;
};

// Os 4 primeiros ficam em grade 2x2, "não quer contato" vai embaixo
const GRID_STATUSES: Status[] = ['not_tried', 'tried', 'scheduled', 'done'];

export function StatusCards({ summary }: StatusCardsProps) {
  const { total, counts, forecast, goal } = summary;
  const missingForForecast = Math.max(goal - forecast, 0);

  return (
    <div className="status-cards">
      {GRID_STATUSES.map((status) => (
        <div key={status} className="status-card">
          <span className="status-card-label">
            <i style={{ background: STATUS_INFO[status].dot }} />
            {STATUS_INFO[status].label}
          </span>
          <span className="status-card-number">{counts[status]}</span>
        </div>
      ))}

      <div className="status-card status-card-wide status-card-forecast">
        <span className="status-card-texts">
          <strong>Previsão de fechamento</strong>
          <small>
            Realizadas + agendadas
            {missingForForecast > 0
              ? ` · faltam ${missingForForecast} para a meta`
              : ' · bate a meta'}
          </small>
        </span>
        <span className="status-card-number">
          {forecast} <small>({percent(forecast, total)}%)</small>
        </span>
      </div>

      <div className="status-card status-card-wide">
        <span className="status-card-label">
          <i style={{ background: STATUS_INFO.opted_out.dot }} />
          {STATUS_INFO.opted_out.label}
        </span>
        <span className="status-card-number">{counts.opted_out}</span>
      </div>
    </div>
  );
}
