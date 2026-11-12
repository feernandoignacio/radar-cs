// "novembro de 2026" -> "Novembro de 2026"
export function currentMonth() {
  const text = new Date().toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}
