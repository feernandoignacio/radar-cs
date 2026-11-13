import type { Client } from '../types.ts';
import type { SheetRow } from './readSpreadsheet.ts';

export type FileKind = 'batch' | 'reasons' | 'contacts';

// Deixa o texto comparável: sem acento, minúsculo, sem "www." e "http://"
export function normalizeName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .replace(/\s+/g, ' ');
}

// Lê uma coluna sem se importar com maiúsculas ou espaços no nome
function column(row: SheetRow, name: string) {
  const wanted = normalizeName(name);
  const key = Object.keys(row).find((item) => normalizeName(item) === wanted);
  return key ? String(row[key] ?? '').trim() : '';
}

// Descobre qual planilha é qual pelas colunas que ela tem
export function detectFileKind(rows: SheetRow[]): FileKind | null {
  const headers = Object.keys(rows[0] ?? {}).map(normalizeName);
  if (headers.includes('cta name')) return 'reasons';
  if (headers.includes('person email')) return 'contacts';
  if (headers.includes('company customer id')) return 'batch';
  return null;
}

type ImportInput = {
  batch: SheetRow[];
  reasons: SheetRow[];
  contacts: SheetRow[];
  previous: Client[];
  removedIds: string[];
  // false = novo mês, todo mundo começa em "Não tentou ainda"
  keepStatus: boolean;
};

export function buildClients({
  batch,
  reasons,
  contacts,
  previous,
  removedIds,
  keepStatus,
}: ImportInput): Client[] {
  // Motivos por empresa. Uma empresa pode ter mais de um CTA.
  const reasonsByCompany = new Map<string, Set<string>>();
  for (const row of reasons) {
    const reason = column(row, 'CTA Name');
    if (!reason) continue;
    const names = [
      column(row, 'Company > Relationship'),
      column(row, 'Relationship Name'),
    ];
    for (const name of names) {
      if (!name) continue;
      const key = normalizeName(name);
      const set = reasonsByCompany.get(key) ?? new Set<string>();
      set.add(reason);
      reasonsByCompany.set(key, set);
    }
  }

  // Contatos por empresa. Na base a mesma empresa aparece várias vezes,
  // aqui todas as linhas viram uma empresa só.
  const contactsByCompany = new Map<
    string,
    { emails: Set<string>; phone: string }
  >();
  for (const row of contacts) {
    const emails = column(row, 'Person Email')
      .split(/[,;\s]+/)
      .map((email) => email.toLowerCase())
      .filter((email) => email.includes('@'));
    const phone = column(row, 'Company Account Phone');
    const names = [
      column(row, 'Company Name'),
      column(row, 'Relationship Name'),
    ];

    for (const name of names) {
      if (!name) continue;
      const key = normalizeName(name);
      const entry = contactsByCompany.get(key) ?? {
        emails: new Set<string>(),
        phone: '',
      };
      for (const email of emails) entry.emails.add(email);
      if (!entry.phone && phone) entry.phone = phone;
      contactsByCompany.set(key, entry);
    }
  }

  const previousById = new Map(previous.map((client) => [client.id, client]));
  const clients: Client[] = [];
  // No "novo mês" as exclusões antigas não valem mais
  const seenIds = new Set<string>(keepStatus ? removedIds : []);

  for (const row of batch) {
    const id = column(row, 'Company Customer ID');
    const company = column(row, 'Company Name');
    // Pula linhas vazias, de total ou repetidas
    if (!id || !company || seenIds.has(id)) continue;
    seenIds.add(id);

    const key = normalizeName(company);
    const found = contactsByCompany.get(key);
    const old = previousById.get(id);

    clients.push({
      id,
      company,
      document: column(row, 'Company Document Number'),
      // Motivo editado à mão vale mais que o da planilha
      reason:
        keepStatus && old?.reasonEdited
          ? old.reason
          : [...(reasonsByCompany.get(key) ?? [])].join(' · '),
      reasonEdited: keepStatus && old?.reasonEdited ? true : undefined,
      emails: [...(found?.emails ?? [])].sort(),
      companyPhone: found?.phone ?? '',
      // O que ela digitou à mão nunca se perde numa nova importação
      contactName: old?.contactName ?? '',
      whatsapp: old?.whatsapp ?? '',
      status: keepStatus && old ? old.status : 'not_tried',
      lastAction: keepStatus && old ? old.lastAction : 'Nenhuma',
      lastContactAt: keepStatus && old ? old.lastContactAt : undefined,
      meetingAt: keepStatus && old ? old.meetingAt : undefined,
    });
  }

  // Ao atualizar o lote, as linhas criadas à mão continuam no topo
  if (keepStatus) {
    const manual = previous.filter((client) => client.isManual);
    return [...manual, ...clients];
  }

  return clients;
}
