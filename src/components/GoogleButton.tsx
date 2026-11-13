import { useEffect, useRef, useState } from 'react';
import type { Session } from '../utils/session.ts';

// O ID do app no Google vem do .env (VITE_GOOGLE_CLIENT_ID)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as
  string | undefined;

// Só o pedaço da biblioteca do Google que a gente usa
type TokenResponse = { access_token?: string; error?: string };
type TokenClient = { requestAccessToken: () => void };
type GoogleOAuth = {
  initTokenClient: (options: {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
  }) => TokenClient;
};

declare global {
  interface Window {
    google?: { accounts: { oauth2: GoogleOAuth } };
  }
}

const SCRIPT_URL = 'https://accounts.google.com/gsi/client';

// Carrega o script do Google uma vez só
function loadGoogleScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Não foi possível carregar o Google.'));
    document.head.appendChild(script);
  });
}

// Com o acesso liberado, pede ao Google o nome, o email e a foto da conta
async function fetchGoogleProfile(accessToken: string): Promise<Session> {
  const response = await fetch(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!response.ok) throw new Error('google');
  const profile = (await response.json()) as {
    name?: string;
    email: string;
    picture?: string;
  };
  return {
    name: profile.name ?? '',
    email: profile.email.toLowerCase(),
    picture: profile.picture,
  };
}

type GoogleButtonProps = {
  onLogin: (session: Session) => void;
  onError: (message: string) => void;
};

// "Continuar com o Google", igual ao do Painel de Candidaturas
export function GoogleButton({ onLogin, onError }: GoogleButtonProps) {
  // Guarda o "cliente" do Google depois que o script carrega
  const clientRef = useRef<TokenClient | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    loadGoogleScript()
      .then(() => {
        const oauth = window.google?.accounts.oauth2;
        if (!oauth) return;

        // Quando a pessoa escolhe a conta na janelinha, o Google chama o callback
        clientRef.current = oauth.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: (response) => {
            if (!response.access_token) {
              onError('Não foi possível entrar com o Google.');
              return;
            }
            fetchGoogleProfile(response.access_token)
              .then(onLogin)
              .catch(() => onError('Não foi possível entrar com o Google.'));
          },
        });
        setReady(true);
      })
      .catch((error: Error) => onError(error.message));
  }, [onLogin, onError]);

  function handleClick() {
    // Sem o ID configurado na Vercel, avisa em vez de não fazer nada
    if (!GOOGLE_CLIENT_ID) {
      onError('O login com Google ainda não foi configurado neste site.');
      return;
    }
    clientRef.current?.requestAccessToken();
  }

  return (
    <>
      <button
        type="button"
        className="google-button"
        onClick={handleClick}
        disabled={Boolean(GOOGLE_CLIENT_ID) && !ready}
      >
        <svg
          className="google-logo"
          viewBox="0 0 48 48"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
        Continuar com o Google
      </button>

      <p className="auth-divider">ou</p>
    </>
  );
}
