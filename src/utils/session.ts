// Sessão de quem entrou no app.
// PROTÓTIPO: não tem servidor ainda, então a senha não é guardada nem
// conferida. Quando tiver banco de dados, o login passa a valer de verdade.
export type Session = {
  name: string;
  email: string;
  // Foto da conta Google, quando a pessoa entra com o Google
  picture?: string;
};

const SESSION_KEY = 'radar-cs:session:v1';

export function loadSession(): Session | null {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? (JSON.parse(saved) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Segue sem salvar
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Nada a fazer
  }
}

// Sem nome digitado, usa o começo do email: "ana.souza@..." vira "Ana Souza"
export function nameFromEmail(email: string) {
  return email
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

// Foto de perfil do email pelo Gravatar. "d=404" faz o Gravatar responder
// com erro quando o email não tem foto, e aí o app usa o avatar genérico.
export async function gravatarUrl(email: string) {
  const data = new TextEncoder().encode(email.trim().toLowerCase());
  const digest = await crypto.subtle.digest('SHA-256', data);
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  return `https://gravatar.com/avatar/${hash}?s=320&d=404`;
}

// Nome de cada conta criada neste navegador, para usar de novo ao entrar
const NAMES_KEY = 'radar-cs:account-names:v1';

function loadNames(): Record<string, string> {
  try {
    const saved = localStorage.getItem(NAMES_KEY);
    return saved ? (JSON.parse(saved) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function saveAccountName(email: string, name: string) {
  try {
    localStorage.setItem(
      NAMES_KEY,
      JSON.stringify({ ...loadNames(), [email]: name }),
    );
  } catch {
    // Segue sem salvar
  }
}

export function accountName(email: string): string | undefined {
  return loadNames()[email];
}

// "Bom dia" até meio-dia, "Boa tarde" até 18h, depois "Boa noite"
export function greetingFor(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
