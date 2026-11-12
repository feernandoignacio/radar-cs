// Situação de cada cliente do lote
export type Status = 'not_tried' | 'tried' | 'scheduled' | 'done' | 'opted_out';

export type Client = {
  // ID do cliente na RD (Company Customer ID), usado para juntar as planilhas
  id: string;
  company: string;
  contactName: string;
  phone: string;
  email: string;
  // Motivo que veio no lote do mês
  reason: string;
  status: Status;
  // Texto curto da última ação, ex: "WhatsApp há 2 dias"
  lastAction: string;
};
