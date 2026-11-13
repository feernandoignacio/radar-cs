import { STATUS_INFO } from '../status.ts';
import { percent, type Summary } from '../utils/summary.ts';
import type { Status } from '../types.ts';
import './StatusCards.css';

type StatusCardsProps = {
  summary: Summary;
};

// Seis cards em 3 colunas e 2 linhas; a previsão fica ao lado, ocupando as duas
const CARD_STATUSES: Status[] = [
  'not_tried',
  'tried',
  'scheduled',
  'done',
  'opted_out',
  'in_review',
];

export function StatusCards({ summary }: StatusCardsProps) {
  const { total, counts, forecast, goal } = summary;
  const missingForForecast = Math.max(goal - forecast, 0);

  return (
    <div className="status-cards">
      {CARD_STATUSES.map((status) => (
        <div key={status} className="status-card">
          <span className="status-card-label">
            <i style={{ background: STATUS_INFO[status].dot }} />
            {STATUS_INFO[status].label}
          </span>
          <span className="status-card-number">{counts[status]}</span>
          {status === 'in_review' && (
            <small className="status-card-hint">Fora da meta</small>
          )}
        </div>
      ))}

      <div className="status-card status-card-forecast">
        <strong className="status-card-forecast-title">
          Previsão de fechamento
        </strong>
        <span className="status-card-number">
          {forecast} <small>({percent(forecast, total)}%)</small>
        </span>
        <small className="status-card-forecast-text">
          Realizadas + agendadas
          <br />
          {missingForForecast > 0
            ? `Faltam ${missingForForecast} para a meta`
            : 'Bate a meta'}
        </small>
      </div>
    </div>
  );
}
