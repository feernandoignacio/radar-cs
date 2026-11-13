import { useState } from 'react';
import App from './App.tsx';
import { ProfilePicker } from './components/ProfilePicker.tsx';
import { SiteFooter } from './components/SiteFooter.tsx';
import { loadSettings, saveSettings } from './utils/storage.ts';
import {
  clearSession,
  loadSession,
  saveSession,
  type Session,
} from './utils/session.ts';
import { dayKey } from './utils/date.ts';

// Primeiro a escolha da carteira, depois o painel dela
export function Root() {
  const [scope, setScope] = useState<string | null>(null);
  const [today] = useState(() => dayKey(new Date()));
  const [session, setSession] = useState(loadSession);

  function handleLogin(next: Session) {
    saveSession(next);
    setSession(next);
    // Primeiro login: o nome já vira a assinatura do modelo da mensagem
    const settings = loadSettings();
    if (!settings.myName) {
      saveSettings({ ...settings, myName: next.name.split(' ')[0] });
    }
  }

  function handleLogout() {
    clearSession();
    setSession(null);
  }

  // Sem login, sempre volta para a tela de entrada
  if (scope === null || session === null) {
    return (
      <>
        {/* key: outra conta monta a tela do zero, com a foto dela */}
        <ProfilePicker
          key={session?.email ?? 'login'}
          today={today}
          session={session}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onOpen={setScope}
        />
        <SiteFooter />
      </>
    );
  }

  // key: trocar de carteira monta o painel do zero, com os dados dela
  return (
    <App
      key={scope}
      scope={scope}
      today={today}
      onSwitch={() => setScope(null)}
    />
  );
}
