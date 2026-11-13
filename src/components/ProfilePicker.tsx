import { SAMPLE_CLIENTS } from '../sampleData.ts';
import { initialsOf, paletteFor, shortDay } from '../team.ts';
import { isPermanent, sharesReceivedBy } from '../utils/shares.ts';
import type { Client } from '../types.ts';
import { useEffect, useState } from 'react';
import { loadBatch, userScope } from '../utils/storage.ts';
import { getSummary } from '../utils/summary.ts';
import { gravatarUrl, type Session } from '../utils/session.ts';
import { AuthForm } from './AuthForm.tsx';
import { BrandLogo } from './BrandLogo.tsx';
import './ProfilePicker.css';

type ProfilePickerProps = {
  today: string;
  // Sem sessão, a tela mostra o login no lugar dos perfis
  session: Session | null;
  onLogin: (session: Session) => void;
  onLogout: () => void;
  onOpen: (scope: string) => void;
};

type Card = {
  scope: string;
  name: string;
  initials: string;
  color: string;
  colorTo: string;
  photo?: string;
  clients: Client[];
  tag: string;
  tagKind: 'mine' | 'edit' | 'view';
};

// Tela de entrada, estilo "quem está assistindo": a carteira da pessoa
// e as dos colegas que deram acesso para ela
export function ProfilePicker({
  today,
  session,
  onLogin,
  onLogout,
  onOpen,
}: ProfilePickerProps) {
  // Foto de perfil: a da conta Google, ou a do Gravatar do email.
  // Se não carregar, fica o avatar genérico com as iniciais.
  const email = session?.email;
  const googlePicture = session?.picture;
  const [gravatar, setGravatar] = useState<string | undefined>(undefined);
  const [photoFailed, setPhotoFailed] = useState(false);
  const photo = photoFailed ? undefined : (googlePicture ?? gravatar);

  useEffect(() => {
    if (googlePicture || !email) return;
    let active = true;
    void gravatarUrl(email).then((url) => {
      if (active) setGravatar(url);
    });
    return () => {
      active = false;
    };
  }, [email, googlePicture]);

  const mine: Card = {
    scope: userScope(email ?? ''),
    name: 'Minha carteira',
    initials: initialsOf(session?.name ?? '') || 'EU',
    color: '#25b574',
    colorTo: '#0e6b57',
    photo,
    clients: loadBatch(userScope(email ?? ''))?.clients ?? SAMPLE_CLIENTS,
    tag: 'Sua',
    tagKind: 'mine',
  };

  // Só aparecem as carteiras que alguém abriu para este email
  const shared: Card[] = email
    ? sharesReceivedBy(email, today).map((share) => {
        const [from, to] = paletteFor(share.ownerEmail);
        return {
          scope: userScope(share.ownerEmail),
          name: share.ownerName,
          initials: initialsOf(share.ownerName),
          color: from,
          colorTo: to,
          clients: loadBatch(userScope(share.ownerEmail))?.clients ?? [],
          tag: `${share.permission === 'edit' ? 'Pode editar' : 'Só visualizar'} ${
            isPermanent(share) ? '· sem prazo' : `até ${shortDay(share.until)}`
          }`,
          tagKind: share.permission,
        };
      })
    : [];

  const cards = [mine, ...shared];

  return (
    <main className="picker">
      {/* Marca à esquerda; quem está logado e o botão Sair à direita */}
      <div className="picker-top">
        <div className="picker-brand">
          <div className="picker-lockup">
            <BrandLogo className="picker-logo" />
            <span>Radar CS</span>
          </div>
          <p>Painel de Customer Success</p>
        </div>

        {session && (
          <div className="picker-account">
            <span>{session.email}</span>
            <button type="button" onClick={onLogout}>
              Sair
            </button>
          </div>
        )}
      </div>

      {/* Sem login: o formulário fica no lugar dos perfis */}
      {!session ? (
        <AuthForm onLogin={onLogin} />
      ) : (
        <>
          <div className="picker-intro">
            <h1>Qual carteira você quer abrir?</h1>
            <p>
              Olá, {session.name.split(' ')[0]}.{' '}
              {shared.length === 0
                ? 'Por enquanto só a sua.'
                : `Além da sua, você tem acesso a ${shared.length} ${shared.length === 1 ? 'carteira' : 'carteiras'} do time.`}
            </p>
          </div>

          <ul className="picker-cards">
            {cards.map((card) => {
              const { total, goal } = getSummary(card.clients);
              return (
                <li key={card.scope}>
                  <button
                    type="button"
                    className="picker-card"
                    onClick={() => onOpen(card.scope)}
                  >
                    <span
                      className="picker-avatar"
                      style={{
                        background: `linear-gradient(135deg, ${card.color}, ${card.colorTo})`,
                      }}
                      aria-hidden="true"
                    >
                      {card.photo ? (
                        <img
                          className="picker-avatar-photo"
                          src={card.photo}
                          alt=""
                          referrerPolicy="no-referrer"
                          onError={() => setPhotoFailed(true)}
                        />
                      ) : (
                        <>
                          {/* Anéis de radar no canto, como desenho do avatar */}
                          <svg
                            className="picker-avatar-rings"
                            viewBox="0 0 100 100"
                          >
                            <circle cx="100" cy="100" r="30" />
                            <circle cx="100" cy="100" r="52" />
                            <circle cx="100" cy="100" r="74" />
                          </svg>
                          <span className="picker-avatar-initials">
                            {card.initials}
                          </span>
                        </>
                      )}
                    </span>
                    <strong>{card.name}</strong>
                    <span className="picker-info">
                      {total} {total === 1 ? 'cliente' : 'clientes'} · meta{' '}
                      {goal}
                    </span>
                    <span className={`picker-tag picker-tag-${card.tagKind}`}>
                      {card.tag}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="picker-note">
            Protótipo: as carteiras dos colegas são de exemplo.
          </p>
        </>
      )}
    </main>
  );
}
