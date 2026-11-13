import { useEffect, useState } from 'react';
import { shortDay } from '../team.ts';
import { nameFromEmail } from '../utils/session.ts';
import type { Permission, Share } from '../utils/shares.ts';
import { DateField } from './DateField.tsx';
import './ConfirmDialog.css';
import './ShareDialog.css';

type ShareDialogProps = {
  today: string;
  // Dona da carteira (quem está logado)
  ownerEmail: string;
  ownerName: string;
  shares: Share[];
  onAdd: (share: Share) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
};

// Janela "Dar acesso": a dona escolhe quem cuida, o período e o que pode fazer
export function ShareDialog({
  today,
  ownerEmail,
  ownerName,
  shares,
  onAdd,
  onRemove,
  onClose,
}: ShareDialogProps) {
  const [colleagueEmail, setColleagueEmail] = useState('');
  const [from, setFrom] = useState(today);
  const [until, setUntil] = useState('');
  const [permission, setPermission] = useState<Permission>('edit');
  const [error, setError] = useState('');

  // Esc fecha
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const email = colleagueEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Digite o email de quem vai cuidar.');
      return;
    }
    if (email === ownerEmail) {
      setError('Esse é o seu próprio email.');
      return;
    }
    if (!until) {
      setError('Escolha até quando vale o acesso.');
      return;
    }
    if (until < from) {
      setError('A data final precisa ser depois da inicial.');
      return;
    }
    onAdd({
      id: `${email}-${Date.now()}`,
      ownerEmail,
      ownerName,
      colleagueEmail: email,
      permission,
      from,
      until,
    });
    setColleagueEmail('');
    setUntil('');
    setError('');
  }

  const colleagueName = colleagueEmail.includes('@')
    ? nameFromEmail(colleagueEmail).split(' ')[0]
    : '';

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div
        className="share-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="share-head">
          <h2 id="share-title">Dar acesso à sua carteira</h2>
          <p>
            Para quando você sair de férias e alguém do time cuidar dos seus
            clientes.
          </p>
        </div>

        <form className="share-form" onSubmit={handleSubmit}>
          <label className="share-field">
            Email de quem vai cuidar
            <input
              type="email"
              value={colleagueEmail}
              placeholder="colega@empresa.com"
              autoComplete="off"
              onChange={(event) => setColleagueEmail(event.target.value)}
            />
          </label>

          <div className="share-dates">
            <div className="share-field">
              <span>De</span>
              <DateField
                label="Início do acesso"
                value={from}
                min={today}
                onChange={setFrom}
              />
            </div>
            <div className="share-field">
              <span>Até</span>
              <DateField
                label="Fim do acesso"
                value={until}
                min={from}
                onChange={setUntil}
              />
            </div>
          </div>

          <fieldset className="share-permission">
            <legend>O que a pessoa pode fazer</legend>
            <label className={permission === 'edit' ? 'is-checked' : ''}>
              <input
                type="radio"
                name="permission"
                checked={permission === 'edit'}
                onChange={() => setPermission('edit')}
              />
              <span>
                <strong>Pode editar</strong>
                Muda status, contatos e manda WhatsApp
              </span>
            </label>
            <label className={permission === 'view' ? 'is-checked' : ''}>
              <input
                type="radio"
                name="permission"
                checked={permission === 'view'}
                onChange={() => setPermission('view')}
              />
              <span>
                <strong>Só visualizar</strong>
                Vê tudo, mas não muda nada
              </span>
            </label>
          </fieldset>

          <p className="share-info">
            O acesso termina sozinho
            {until ? ` no dia ${shortDay(until)}` : ' na data final'}. O que{' '}
            {colleagueName || 'a pessoa'} mudar fica registrado com o nome de
            quem mudou.
          </p>

          {error && (
            <p className="share-error" role="alert">
              {error}
            </p>
          )}

          <div className="confirm-actions">
            <button type="button" className="confirm-cancel" onClick={onClose}>
              Fechar
            </button>
            <button type="submit" className="confirm-safe">
              Dar acesso
            </button>
          </div>
        </form>

        {/* Sempre visível: quem tem acesso e o botão para tirar */}
        <div className="share-list">
          <h3>Quem tem acesso agora</h3>
          {shares.length === 0 ? (
            <p className="share-empty">Ninguém tem acesso à sua carteira.</p>
          ) : (
            <ul>
              {shares.map((share) => (
                <li key={share.id}>
                  <span>
                    <strong>{share.colleagueEmail}</strong>
                    {share.permission === 'edit'
                      ? ' · pode editar'
                      : ' · só visualizar'}{' '}
                    · {shortDay(share.from)} a {shortDay(share.until)}
                  </span>
                  <button type="button" onClick={() => onRemove(share.id)}>
                    Tirar acesso
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="share-proto">
          Protótipo: o acesso vale para quem entrar com esse email neste
          navegador. Com o banco de dados, vai valer em qualquer computador.
        </p>
      </div>
    </div>
  );
}
