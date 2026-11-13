import type { Client, Status } from './types.ts';
import { dayKey, shortDay } from './utils/todo.ts';

// Datas relativas a hoje, para o "Para fazer hoje" ter o que mostrar
function daysFromToday(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

const yesterday = dayKey(daysFromToday(-1));
const inThreeDays = dayKey(daysFromToday(3));

// Dados inventados, só para ver a tela funcionando antes de importar
const SAMPLES: [string, string, Status, string, Partial<Client>?][] = [
  ['Padaria Estrela', 'Queda de uso', 'not_tried', 'Nenhuma'],
  ['Clínica Vida Plena', 'Renovação próxima', 'not_tried', 'Nenhuma'],
  [
    'Auto Center Rota 10',
    'Baixo engajamento',
    'tried',
    `WhatsApp em ${shortDay(dayKey(daysFromToday(-6)))}`,
    { lastContactAt: daysFromToday(-6).toISOString() },
  ],
  [
    'Escola Aprender',
    'Onboarding parado',
    'tried',
    `WhatsApp em ${shortDay(dayKey(daysFromToday(-1)))}`,
    { lastContactAt: daysFromToday(-1).toISOString() },
  ],
  ['Studio Fit', 'Queda de uso', 'opted_out', 'Pediu para não ligar'],
  [
    'Imobiliária Casa Nova',
    'Renovação próxima',
    'scheduled',
    `Reunião marcada para ${shortDay(yesterday)}`,
    { meetingAt: yesterday },
  ],
  [
    'Café do Porto',
    'Expansão',
    'scheduled',
    `Reunião marcada para ${shortDay(inThreeDays)}`,
    { meetingAt: inThreeDays },
  ],
  ['Ótica Visão Clara', 'Baixo engajamento', 'done', 'Reunião 10/11'],
  ['Pet Shop Amigo Fiel', 'Queda de uso', 'done', 'Reunião 11/11'],
  ['Floricultura Primavera', 'Onboarding parado', 'not_tried', 'Nenhuma'],
];

export const SAMPLE_CLIENTS: Client[] = SAMPLES.map(
  ([company, reason, status, lastAction, extra], index) => ({
    id: String(1001 + index),
    company,
    document: '',
    reason,
    emails: [`contato${index + 1}@exemplo.com`],
    // Algumas sem telefone, para ver como a tela fica
    companyPhone: index % 3 === 0 ? '' : `(11) 90000-000${index}`,
    contactName: '',
    whatsapp: '',
    status,
    lastAction,
    ...extra,
  }),
);
