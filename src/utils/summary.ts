import { STATUS_ORDER } from '../status.ts';
import type { Client, Status } from '../types.ts';

// Meta da RD: 50% do lote com reunião realizada
export const GOAL_RATE = 0.5;

export type Summary = {
  total: number;
  counts: Record<Status, number>;
  goal: number;
  forecast: number;
  missingForGoal: number;
};

export function getSummary(clients: Client[]): Summary {
  // Começa todos os status em zero e soma cliente por cliente
  const counts = Object.fromEntries(
    STATUS_ORDER.map((status) => [status, 0]),
  ) as Record<Status, number>;

  for (const client of clients) {
    counts[client.status] += 1;
  }

  const total = clients.length;
  const goal = Math.ceil(total * GOAL_RATE);
  // Previsão de fechamento = realizadas + agendadas
  const forecast = counts.done + counts.scheduled;

  return {
    total,
    counts,
    goal,
    forecast,
    missingForGoal: Math.max(goal - counts.done, 0),
  };
}

// Porcentagem arredondada, protegida contra lote vazio
export function percent(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
