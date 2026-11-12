import type { Client } from '../types.ts';

export type MessageSettings = {
  myName: string;
  scheduleLink: string;
  template: string;
};

export const DEFAULT_SETTINGS: MessageSettings = {
  myName: '',
  scheduleLink: '',
  template:
    'Oi {contato}, tudo bem? Aqui é a {meu_nome}, do time de Customer Success. ' +
    'Cuido da conta da {empresa} e queria marcar uma conversa rápida para ver ' +
    'como estão os resultados. Pode escolher o melhor horário por aqui: {link_agenda}',
};

export const VARIABLES = [
  '{contato}',
  '{empresa}',
  '{meu_nome}',
  '{link_agenda}',
];

export function fillTemplate(
  template: string,
  client: Client,
  settings: MessageSettings,
) {
  return (
    template
      // Sem nome do contato, tira a variável e o espaço antes dela:
      // "Oi {contato}, tudo bem?" vira "Oi, tudo bem?"
      .replace(
        client.contactName ? /\{contato\}/g : / ?\{contato\}/g,
        client.contactName,
      )
      .replace(/\{empresa\}/g, client.company)
      .replace(/\{meu_nome\}/g, settings.myName || '[seu nome]')
      .replace(/\{link_agenda\}/g, settings.scheduleLink || '[link da agenda]')
  );
}

// Número que o WhatsApp entende: só dígitos e com o 55 do Brasil
export function toWhatsappNumber(raw: string) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (
    (digits.length === 12 || digits.length === 13) &&
    digits.startsWith('55')
  ) {
    return digits;
  }
  return null;
}

// Telefone usado para o WhatsApp: o que ela digitou ou o da empresa
export function clientPhone(client: Client) {
  return toWhatsappNumber(client.whatsapp || client.companyPhone);
}

export function whatsappUrl(phone: string, text: string) {
  // encodeURIComponent troca espaço por %20 (o WhatsApp mostraria "+" literal)
  return `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
}
