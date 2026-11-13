import { useState } from 'react';
import App from './App.tsx';
import { ProfilePicker } from './components/ProfilePicker.tsx';
import { SiteFooter } from './components/SiteFooter.tsx';
import { loadSettings } from './utils/storage.ts';
import { dayKey } from './utils/date.ts';

// Primeiro a escolha da carteira, depois o painel dela
export function Root() {
  const [scope, setScope] = useState<string | null>(null);
  const [today] = useState(() => dayKey(new Date()));

  if (scope === null) {
    return (
      <>
        <ProfilePicker
          today={today}
          myName={loadSettings().myName}
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
