import type { Client } from '../types.ts';

// Depois de quantos dias sem resposta vale tentar de novo
export const RETRY_AFTER_DAYS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

export type TodoList = {
  // Agendadas com a data da reunião hoje ou antes: falta marcar como realizada
  meetings: Client[];
  // Agendadas sem a data da reunião preenchida
  scheduledWithoutDate: number;
  // Sem sucesso e sem tentativa nova há alguns dias
  retry: Client[];
  // Ainda não procurados
  notContacted: Client[];
};

// Dia no formato 2026-11-18, no fuso de quem está usando
export function dayKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// 2026-11-18 vira 18/11
export function shortDay(key: string) {
  const [, month, day] = key.split('-');
  return `${day}/${month}`;
}

// Data da última tentativa. Para dados antigos, que ainda não guardavam
// a data, tenta ler o "12/11" do texto da última ação.
export function lastContactDate(client: Client, now: Date): Date | null {
  if (client.lastContactAt) return new Date(client.lastContactAt);

  const match = client.lastAction.match(/(\d{2})\/(\d{2})/);
  if (!match) return null;
  const date = new Date(
    now.getFullYear(),
    Number(match[2]) - 1,
    Number(match[1]),
  );
  // "28/12" lido em janeiro é do ano anterior
  if (date.getTime() > now.getTime()) date.setFullYear(date.getFullYear() - 1);
  return date;
}

export function daysSince(date: Date, now: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((end.getTime() - start.getTime()) / DAY_MS);
}

export function getTodo(clients: Client[], now: Date): TodoList {
  const today = dayKey(now);
  const scheduled = clients.filter((client) => client.status === 'scheduled');

  const meetings = scheduled
    .filter((client) => client.meetingAt && client.meetingAt <= today)
    .sort((a, b) => (a.meetingAt ?? '').localeCompare(b.meetingAt ?? ''));

  // Quem está esperando há mais tempo aparece primeiro
  const retry = clients
    .filter((client) => {
      if (client.status !== 'tried') return false;
      const last = lastContactDate(client, now);
      return last !== null && daysSince(last, now) >= RETRY_AFTER_DAYS;
    })
    .sort(
      (a, b) =>
        (lastContactDate(a, now)?.getTime() ?? 0) -
        (lastContactDate(b, now)?.getTime() ?? 0),
    );

  return {
    meetings,
    scheduledWithoutDate: scheduled.filter((client) => !client.meetingAt)
      .length,
    retry,
    notContacted: clients.filter(
      (client) => client.status === 'not_tried' && client.company,
    ),
  };
}
