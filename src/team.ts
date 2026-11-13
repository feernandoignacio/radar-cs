// Cores dos avatares das carteiras de colegas na tela de entrada
const PALETTES: [string, string][] = [
  ['#2f6fdb', '#6d3fd1'],
  ['#c2418f', '#7c4dd6'],
  ['#d9541e', '#b45309'],
  ['#14b8a6', '#0369a1'],
  ['#f59e0b', '#d9541e'],
];

// A mesma pessoa sempre ganha a mesma cor
export function paletteFor(email: string): [string, string] {
  let sum = 0;
  for (const char of email) sum += char.charCodeAt(0);
  return PALETTES[sum % PALETTES.length];
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

// 2026-11-20 vira 20/11
export function shortDay(key: string) {
  const [, month, day] = key.split('-');
  return `${day}/${month}`;
}
