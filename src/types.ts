// Situação de cada cliente do lote
export type Status = 'not_tried' | 'tried' | 'scheduled' | 'done' | 'opted_out';

export type Client = {
  // ID do cliente na RD (Company Customer ID), vem do lote
  id: string;
  company: string;
  // CNPJ
  document: string;
  // Motivo(s) que vieram da planilha de CTAs
  reason: string;
  // Emails encontrados na base, sem repetição
  emails: string[];
  // Telefone da empresa na base (vazio quando não tem)
  companyPhone: string;
  // Preenchidos à mão por ela
  contactName: string;
  whatsapp: string;
  status: Status;
  // Texto curto da última ação, ex: "Status alterado em 12/11"
  lastAction: string;
};

export type Batch = {
  importedAt: string;
  clients: Client[];
};
