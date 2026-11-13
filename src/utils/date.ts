// "novembro de 2026" -> "Novembro de 2026"
export function currentMonth() {
  const text = new Date().toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// "Novembro de 2026" -> "novembro-2026", para o nome do arquivo
export function monthSlug() {
  return currentMonth()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+de\s+/g, '-')
    .replace(/\s+/g, '-');
}

// Dia no formato 2026-11-18, no fuso de quem está usando
export function dayKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
