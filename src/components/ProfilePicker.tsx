import { SAMPLE_CLIENTS } from '../sampleData.ts';
import {
  RECEIVED_ACCESS,
  colleagueById,
  demoClients,
  shortDay,
} from '../team.ts';
import type { Client } from '../types.ts';
import { loadBatch } from '../utils/storage.ts';
import { getSummary } from '../utils/summary.ts';
import { BrandLogo } from './BrandLogo.tsx';
import { RadarBackdrop } from './RadarBackdrop.tsx';
import './ProfilePicker.css';

type ProfilePickerProps = {
  today: string;
  myName: string;
  onOpen: (scope: string) => void;
};

type Card = {
  scope: string;
  name: string;
  initials: string;
  color: string;
  colorTo: string;
  clients: Client[];
  tag: string;
  tagKind: 'mine' | 'edit' | 'view';
};

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'EU';
}

// Tela de entrada, estilo "quem está assistindo": a carteira da pessoa
// e as dos colegas que deram acesso para ela
export function ProfilePicker({ today, myName, onOpen }: ProfilePickerProps) {
  const mine: Card = {
    scope: 'me',
    name: 'Minha carteira',
    initials: initialsOf(myName),
    color: '#25b574',
    colorTo: '#0e6b57',
    clients: loadBatch('me')?.clients ?? SAMPLE_CLIENTS,
    tag: 'Sua',
    tagKind: 'mine',
  };

  const shared: Card[] = RECEIVED_ACCESS.filter(
    (access) => access.until >= today,
  ).flatMap((access) => {
    const owner = colleagueById(access.ownerId);
    if (!owner) return [];
    return [
      {
        scope: owner.id,
        name: owner.name,
        initials: initialsOf(owner.name),
        color: owner.color,
        colorTo: owner.colorTo,
        clients: loadBatch(owner.id)?.clients ?? demoClients(owner.id),
        tag:
          access.permission === 'edit'
            ? `${access.reason} até ${shortDay(access.until)}`
            : `Só visualizar até ${shortDay(access.until)}`,
        tagKind: access.permission,
      },
    ];
  });

  const cards = [mine, ...shared];

  return (
    <main className="picker">
      <RadarBackdrop />

      <div className="picker-brand">
        <div className="picker-lockup">
          <BrandLogo className="picker-logo" />
          <span>Radar CS</span>
        </div>
        <p>Painel de Customer Success</p>
      </div>

      <div className="picker-intro">
        <h1>Qual carteira você quer abrir?</h1>
        <p>
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
                  {/* Anéis de radar no canto, como desenho do avatar */}
                  <svg className="picker-avatar-rings" viewBox="0 0 100 100">
                    <circle cx="100" cy="100" r="30" />
                    <circle cx="100" cy="100" r="52" />
                    <circle cx="100" cy="100" r="74" />
                  </svg>
                  <span className="picker-avatar-initials">
                    {card.initials}
                  </span>
                </span>
                <strong>{card.name}</strong>
                <span className="picker-info">
                  {total} clientes · meta {goal}
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
    </main>
  );
}
