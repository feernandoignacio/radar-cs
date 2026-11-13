import { initialsOf, paletteFor, shortDay } from '../team.ts';
import { isPermanent, type Share } from '../utils/shares.ts';
import './CoverBanner.css';

type CoverBannerProps = {
  share: Share;
  onSwitch: () => void;
};

// Faixa fixa no topo: deixa claro que a carteira aberta é de outra pessoa
export function CoverBanner({ share, onSwitch }: CoverBannerProps) {
  const [from, to] = paletteFor(share.ownerEmail);

  return (
    <div className="cover-banner" role="status">
      <span
        className="cover-avatar"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        aria-hidden="true"
      >
        {initialsOf(share.ownerName)}
      </span>
      <p>
        <strong>Você está na carteira de {share.ownerName}.</strong>{' '}
        {share.permission === 'edit'
          ? `${isPermanent(share) ? 'Acesso sem prazo' : `Cobrindo até ${shortDay(share.until)}`}. O que você mudar fica com o seu nome.`
          : `Só visualizar${isPermanent(share) ? ', sem prazo' : `, até ${shortDay(share.until)}`}.`}
      </p>
      <button type="button" onClick={onSwitch}>
        Voltar para a minha
      </button>
    </div>
  );
}
