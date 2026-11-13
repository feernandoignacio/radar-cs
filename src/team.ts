import type { Client, Status } from './types.ts';

// PROTÓTIPO: time e acessos inventados, só para ver as telas funcionando.
// Quando tiver banco de dados e login, isto vem do servidor.

export type Permission = 'edit' | 'view';

export type Colleague = {
  id: string;
  name: string;
  color: string;
  // Segunda cor do degradê do avatar na tela de entrada
  colorTo: string;
};

// Cores que a pessoa pode escolher para o avatar
export const AVATAR_PALETTES: [string, string][] = [
  ['#25b574', '#0e6b57'],
  ['#2f6fdb', '#6d3fd1'],
  ['#c2418f', '#7c4dd6'],
  ['#f59e0b', '#d9541e'],
  ['#14b8a6', '#0369a1'],
];

export const TEAM: Colleague[] = [
  { id: 'bruno', name: 'Bruno Lima', color: '#2f6fdb', colorTo: '#6d3fd1' },
  { id: 'carla', name: 'Carla Dias', color: '#c2418f', colorTo: '#7c4dd6' },
  { id: 'diego', name: 'Diego Rocha', color: '#d9541e', colorTo: '#b45309' },
];

// Carteiras de colegas que deram acesso para quem está usando
export type ReceivedAccess = {
  ownerId: string;
  permission: Permission;
  // Último dia do acesso, no formato 2026-11-20
  until: string;
  reason: string;
};

function dayFromToday(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export const RECEIVED_ACCESS: ReceivedAccess[] = [
  {
    ownerId: 'bruno',
    permission: 'edit',
    until: dayFromToday(7),
    reason: 'Férias',
  },
  {
    ownerId: 'carla',
    permission: 'view',
    until: dayFromToday(20),
    reason: 'Acompanhar',
  },
];

export function colleagueById(id: string) {
  return TEAM.find((person) => person.id === id);
}

// 2026-11-20 vira 20/11
export function shortDay(key: string) {
  const [, month, day] = key.split('-');
  return `${day}/${month}`;
}

// Clientes inventados para a carteira de cada colega
const DEMO: Record<string, [string, Status][]> = {
  bruno: [
    ['Mercado Bom Preço', 'not_tried'],
    ['Academia Movimento', 'tried'],
    ['Contabilidade Exata', 'scheduled'],
    ['Hotel Serra Azul', 'done'],
    ['Livraria Página', 'not_tried'],
    ['Oficina Turbo', 'done'],
    ['Doceria Açúcar', 'tried'],
    ['Agência Norte', 'not_tried'],
  ],
  carla: [
    ['Clínica Sorriso', 'done'],
    ['Pizzaria Forno', 'scheduled'],
    ['Escola Futuro', 'done'],
    ['Loja Estilo', 'not_tried'],
    ['Transportes Rota', 'opted_out'],
    ['Pet Feliz', 'done'],
  ],
};

export function demoClients(ownerId: string): Client[] {
  return (DEMO[ownerId] ?? []).map(([company, status], index) => ({
    id: `${ownerId}-${index + 1}`,
    company,
    document: '',
    reason: 'Exemplo',
    emails: [`contato${index + 1}@exemplo.com`],
    companyPhone: `(11) 90000-00${10 + index}`,
    contactName: '',
    whatsapp: '',
    status,
    lastAction: 'Nenhuma',
  }));
}
