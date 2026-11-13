import { shortDay, type Colleague, type ReceivedAccess } from '../team.ts';
import './CoverBanner.css';

type CoverBannerProps = {
  owner: Colleague;
  access: ReceivedAccess;
  onSwitch: () => void;
};

// Faixa fixa no topo: deixa claro que a carteira aberta é de outra pessoa
export function CoverBanner({ owner, access, onSwitch }: CoverBannerProps) {
  const initials = owner.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="cover-banner" role="status">
      <span
        className="cover-avatar"
        style={{ background: owner.color }}
        aria-hidden="true"
      >
        {initials}
      </span>
      <p>
        <strong>Você está na carteira de {owner.name}.</strong>{' '}
        {access.permission === 'edit'
          ? `Cobrindo até ${shortDay(access.until)}. O que você mudar fica com o seu nome.`
          : `Só visualizar, até ${shortDay(access.until)}.`}
      </p>
      <button type="button" onClick={onSwitch}>
        Voltar para a minha
      </button>
    </div>
  );
}
