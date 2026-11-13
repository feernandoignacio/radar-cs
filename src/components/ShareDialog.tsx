import { useEffect, useState } from 'react';
import { TEAM, colleagueById, shortDay, type Permission } from '../team.ts';
import type { Share } from '../utils/shares.ts';
import { DateField } from './DateField.tsx';
import './ConfirmDialog.css';
import './ShareDialog.css';

type ShareDialogProps = {
  today: string;
  shares: Share[];
  onAdd: (share: Share) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
};

// Janela "Dar acesso": a dona escolhe quem cuida, o período e o que pode fazer
export function ShareDialog({
  today,
  shares,
  onAdd,
  onRemove,
  onClose,
}: ShareDialogProps) {
  const [colleagueId, setColleagueId] = useState(TEAM[0].id);
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
    if (!until) {
      setError('Escolha até quando vale o acesso.');
      return;
    }
    if (until < from) {
      setError('A data final precisa ser depois da inicial.');
      return;
    }
    onAdd({
      id: `${colleagueId}-${Date.now()}`,
      colleagueId,
      permission,
      from,
      until,
    });
    setUntil('');
    setError('');
  }

  const owner = colleagueById(colleagueId);

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
            Quem vai cuidar
            <select
              value={colleagueId}
              onChange={(event) => setColleagueId(event.target.value)}
            >
              {TEAM.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
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
            {owner?.name.split(' ')[0] ?? 'a pessoa'} mudar fica registrado com
            o nome dele.
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

        {shares.length > 0 && (
          <div className="share-list">
            <h3>Quem tem acesso agora</h3>
            <ul>
              {shares.map((share) => (
                <li key={share.id}>
                  <span>
                    <strong>{colleagueById(share.colleagueId)?.name}</strong>
                    {share.permission === 'edit'
                      ? ' · pode editar'
                      : ' · só visualizar'}{' '}
                    · até {shortDay(share.until)}
                  </span>
                  <button type="button" onClick={() => onRemove(share.id)}>
                    Tirar acesso
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="share-proto">
          Protótipo: o acesso fica salvo só aqui e ainda não chega ao colega.
        </p>
      </div>
    </div>
  );
}
