import { STATUS_INFO } from '../status.ts';
import { percent, type Summary } from '../utils/summary.ts';
import './GoalCard.css';

type GoalCardProps = {
  summary: Summary;
};

export function GoalCard({ summary }: GoalCardProps) {
  const { total, counts, goal, missingForGoal } = summary;
  const donePercent = percent(counts.done, total);
  const scheduledPercent = percent(counts.scheduled, total);

  return (
    <section className="goal-card" aria-labelledby="goal-title">
      <div className="goal-top">
        <h2 id="goal-title" className="goal-title">
          Meta do mês: 50% de reuniões realizadas
        </h2>
        <span className="goal-note">
          Atualiza na hora · no sistema da RD leva 24h
        </span>
      </div>

      <div className="goal-numbers">
        <span className="goal-big">
          {counts.done} de {total}
        </span>
        <span className="goal-label">reuniões realizadas ({donePercent}%)</span>
      </div>

      {/* Barra: verde = realizadas, amarelo = agendadas, linha = meta */}
      <div
        className="goal-bar"
        role="img"
        aria-label={`${donePercent}% realizadas, ${scheduledPercent}% agendadas, meta de 50%`}
      >
        <div className="goal-bar-done" style={{ width: `${donePercent}%` }} />
        <div
          className="goal-bar-scheduled"
          style={{ left: `${donePercent}%`, width: `${scheduledPercent}%` }}
        />
        <div className="goal-bar-target" />
      </div>

      <div className="goal-legend">
        <span>
          <i style={{ background: STATUS_INFO.done.dot }} />
          Realizadas: {counts.done}
        </span>
        <span>
          <i style={{ background: STATUS_INFO.scheduled.dot }} />
          Agendadas: {counts.scheduled}
        </span>
        <span>
          <i className="goal-legend-line" />
          Meta: {goal} reuniões
        </span>
        {missingForGoal > 0 ? (
          <strong className="goal-missing">
            Faltam {missingForGoal} reuniões
          </strong>
        ) : (
          <strong className="goal-reached">Meta batida!</strong>
        )}
      </div>
    </section>
  );
}
