import { useState } from 'react';
import App from './App.tsx';
import { ProfilePicker } from './components/ProfilePicker.tsx';
import { SiteFooter } from './components/SiteFooter.tsx';
import {
  claimLegacyData,
  loadSettings,
  saveSettings,
  userScope,
} from './utils/storage.ts';
import { sharesReceivedBy } from './utils/shares.ts';
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
    const scope = userScope(next.email);
    // Dados de antes do login viram a carteira de quem entra primeiro
    claimLegacyData(scope);
    saveSession(next);
    setSession(next);
    // Primeiro login: o nome já vira a assinatura do modelo da mensagem
    const settings = loadSettings(scope);
    if (!settings.myName && next.name) {
      saveSettings({ ...settings, myName: next.name.split(' ')[0] }, scope);
    }
  }

  function handleLogout() {
    clearSession();
    setSession(null);
    setScope(null);
  }

  const myScope = session ? userScope(session.email) : '';
  // Carteira de colega só abre com um acesso valendo hoje
  const share =
    session && scope && scope !== myScope
      ? sharesReceivedBy(session.email, today).find(
          (item) => userScope(item.ownerEmail) === scope,
        )
      : undefined;
  const canOpen = scope !== null && (scope === myScope || share !== undefined);

  // Sem login (ou sem acesso), volta para a tela de entrada
  if (session === null || !canOpen) {
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
      myScope={myScope}
      session={session}
      share={share}
      today={today}
      onSwitch={() => setScope(null)}
    />
  );
}
