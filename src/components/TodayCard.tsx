import type { ReactNode } from 'react';
import type { Client, Status } from '../types.ts';
import { clientPhone } from '../utils/message.ts';
import {
  daysSince,
  lastContactDate,
  shortDay,
  type TodoList,
} from '../utils/todo.ts';
import './TodayCard.css';

// Quantos clientes cada lista mostra antes do "Ver todos"
const VISIBLE = 3;

type TodayCardProps = {
  todo: TodoList;
  now: Date;
  onStatusChange: (id: string, status: Status) => void;
  onWhatsapp: (client: Client) => void;
  onShowStatus: (status: Status) => void;
};

// O que precisa de atenção agora: reuniões para confirmar,
// quem não respondeu e quem ainda não foi procurado
export function TodayCard({
  todo,
  now,
  onStatusChange,
  onWhatsapp,
  onShowStatus,
}: TodayCardProps) {
  const total =
    todo.meetings.length + todo.retry.length + todo.notContacted.length;

  return (
    <section className="today-card" aria-labelledby="today-title">
      <div className="today-top">
        <h2 id="today-title" className="today-title">
          Para fazer hoje
        </h2>
        <p className="today-note">
          {total === 0 ? 'Tudo em dia' : `${total} pendências`}
        </p>
      </div>

      <div className="today-groups">
        <TodayGroup
          title="Confirmar reuniões"
          dot="#E0A21B"
          clients={todo.meetings}
          empty="Nenhuma reunião para confirmar."
          moreLabel="Ver agendadas"
          onMore={() => onShowStatus('scheduled')}
          detail={(client) =>
            client.meetingAt === undefined
              ? ''
              : `Reunião em ${shortDay(client.meetingAt)}`
          }
          action={(client) => (
            <button
              type="button"
              className="today-action today-action-done"
              aria-label={`Marcar reunião com ${client.company} como realizada`}
              onClick={() => onStatusChange(client.id, 'done')}
            >
              Realizada
            </button>
          )}
          footnote={
            todo.scheduledWithoutDate > 0 && (
              <button
                type="button"
                className="today-footnote"
                onClick={() => onShowStatus('scheduled')}
              >
                {todo.scheduledWithoutDate === 1
                  ? '1 agendada sem data da reunião'
                  : `${todo.scheduledWithoutDate} agendadas sem data da reunião`}
              </button>
            )
          }
        />

        <TodayGroup
          title="Tentar de novo"
          dot="#7C4DD6"
          clients={todo.retry}
          empty="Ninguém esperando resposta há muito tempo."
          moreLabel="Ver sem sucesso"
          onMore={() => onShowStatus('tried')}
          detail={(client) => {
            const last = lastContactDate(client, now);
            return last
              ? `Última tentativa há ${daysSince(last, now)} dias`
              : '';
          }}
          action={(client) => (
            <WhatsappAction
              client={client}
              label="Reenviar"
              onWhatsapp={onWhatsapp}
            />
          )}
        />

        <TodayGroup
          title="Ainda não contatados"
          dot="#8A929C"
          clients={todo.notContacted}
          empty="Todos já foram procurados."
          moreLabel="Ver não tentou"
          onMore={() => onShowStatus('not_tried')}
          detail={(client) => client.reason}
          action={(client) => (
            <WhatsappAction
              client={client}
              label="Enviar"
              onWhatsapp={onWhatsapp}
            />
          )}
        />
      </div>
    </section>
  );
}

type TodayGroupProps = {
  title: string;
  dot: string;
  clients: Client[];
  empty: string;
  moreLabel: string;
  onMore: () => void;
  detail: (client: Client) => string;
  action: (client: Client) => ReactNode;
  footnote?: ReactNode;
};

function TodayGroup({
  title,
  dot,
  clients,
  empty,
  moreLabel,
  onMore,
  detail,
  action,
  footnote,
}: TodayGroupProps) {
  const hidden = clients.length - VISIBLE;

  return (
    <div className="today-group">
      <h3 className="today-group-title">
        <span className="today-dot" style={{ background: dot }} />
        {title}
        <span className="today-count">{clients.length}</span>
      </h3>

      {clients.length === 0 ? (
        <p className="today-empty">{empty}</p>
      ) : (
        <ul className="today-list">
          {clients.slice(0, VISIBLE).map((client) => (
            <li key={client.id} className="today-item">
              <div className="today-item-text">
                <span className="today-company">{client.company}</span>
                <span className="today-detail">{detail(client)}</span>
              </div>
              {action(client)}
            </li>
          ))}
        </ul>
      )}

      {hidden > 0 && (
        <button type="button" className="today-more" onClick={onMore}>
          {moreLabel} (+{hidden})
        </button>
      )}
      {footnote}
    </div>
  );
}

function WhatsappAction({
  client,
  label,
  onWhatsapp,
}: {
  client: Client;
  label: string;
  onWhatsapp: (client: Client) => void;
}) {
  const hasPhone = Boolean(clientPhone(client));

  return (
    <button
      type="button"
      className="today-action"
      disabled={!hasPhone}
      title={
        hasPhone
          ? 'Abrir no WhatsApp Web com a mensagem pronta'
          : 'Adicione um WhatsApp na coluna Contatos'
      }
      aria-label={`${label} WhatsApp para ${client.company}`}
      onClick={() => onWhatsapp(client)}
    >
      {label}
    </button>
  );
}
