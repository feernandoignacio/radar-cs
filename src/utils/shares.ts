// Acessos que uma pessoa dá à sua carteira para alguém do time.
// PROTÓTIPO: ficam salvos neste navegador. Para testar, entre com uma
// conta, dê acesso a outro email, saia e entre com esse outro email.
// Com o banco de dados, isso passa a valer entre computadores.
export type Permission = 'edit' | 'view';

export type Share = {
  id: string;
  ownerEmail: string;
  ownerName: string;
  colleagueEmail: string;
  permission: Permission;
  // Dias no formato 2026-11-20
  from: string;
  until: string;
};

const SHARES_KEY = 'radar-cs:shares:v2';

export function loadShares(): Share[] {
  try {
    const saved = localStorage.getItem(SHARES_KEY);
    return saved ? (JSON.parse(saved) as Share[]) : [];
  } catch {
    return [];
  }
}

export function saveShares(shares: Share[]) {
  try {
    localStorage.setItem(SHARES_KEY, JSON.stringify(shares));
  } catch {
    // Segue sem salvar
  }
}

// Acesso vencido some sozinho
export function isActive(share: Share, today: string) {
  return share.from <= today && share.until >= today;
}

// Acessos que eu dei (ainda não vencidos)
export function sharesGivenBy(email: string, today: string) {
  return loadShares().filter(
    (share) => share.ownerEmail === email && share.until >= today,
  );
}

// Carteiras que outras pessoas abriram para mim, valendo hoje
export function sharesReceivedBy(email: string, today: string) {
  return loadShares().filter(
    (share) => share.colleagueEmail === email && isActive(share, today),
  );
}
