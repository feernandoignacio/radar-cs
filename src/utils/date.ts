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
