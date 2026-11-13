import type { Client, Status } from './types.ts';

// Dados inventados, só para ver a tela funcionando antes de importar
const SAMPLES: [string, string, Status, string][] = [
  ['Padaria Estrela', 'Queda de uso', 'not_tried', 'Nenhuma'],
  ['Clínica Vida Plena', 'Renovação próxima', 'not_tried', 'Nenhuma'],
  ['Auto Center Rota 10', 'Baixo engajamento', 'tried', 'WhatsApp há 6 dias'],
  ['Escola Aprender', 'Onboarding parado', 'tried', 'WhatsApp há 2 dias'],
  ['Studio Fit', 'Queda de uso', 'opted_out', 'Pediu para não ligar'],
  ['Imobiliária Casa Nova', 'Renovação próxima', 'scheduled', 'Reunião 18/11'],
  ['Café do Porto', 'Expansão', 'scheduled', 'Reunião 19/11'],
  ['Ótica Visão Clara', 'Baixo engajamento', 'done', 'Reunião 10/11'],
  ['Pet Shop Amigo Fiel', 'Queda de uso', 'done', 'Reunião 11/11'],
  ['Floricultura Primavera', 'Onboarding parado', 'not_tried', 'Nenhuma'],
];

export const SAMPLE_CLIENTS: Client[] = SAMPLES.map(
  ([company, reason, status, lastAction], index) => ({
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
  }),
);
