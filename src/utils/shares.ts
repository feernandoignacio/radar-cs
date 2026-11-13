import type { Permission } from '../team.ts';

// Acessos que a dona da carteira deu para colegas
export type Share = {
  id: string;
  colleagueId: string;
  permission: Permission;
  from: string;
  until: string;
};

const SHARES_KEY = 'radar-cs:shares:v1';

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
export function activeShares(shares: Share[], today: string) {
  return shares.filter((share) => share.until >= today);
}
