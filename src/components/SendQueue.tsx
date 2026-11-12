import { useState } from 'react';
import type { Client } from '../types.ts';
import { fillTemplate, type MessageSettings } from '../utils/message.ts';
import './SendQueue.css';

export type Queue = {
  ids: string[];
  index: number;
  sent: number;
  skipped: number;
  // Selecionados que ficaram de fora por não ter telefone
  withoutPhone: number;
};

type SendQueueProps = {
  queue: Queue;
  client: Client | undefined;
  settings: MessageSettings;
  onOpen: (client: Client) => void;
  onNext: (wasSent: boolean) => void;
  onClose: () => void;
};

export function SendQueue({
  queue,
  client,
  settings,
  onOpen,
  onNext,
  onClose,
}: SendQueueProps) {
  // Guarda se o WhatsApp do cliente atual já foi aberto
  const [openedId, setOpenedId] = useState<string | null>(null);
  const total = queue.ids.length;
  const isDone = queue.index >= total || !client;
  const progress = total === 0 ? 100 : Math.round((queue.index / total) * 100);

  if (isDone) {
    return (
      <section className="send-queue" aria-live="polite">
        <h2>Fila concluída</h2>
        <p className="send-queue-summary">
          {queue.sent}{' '}
          {queue.sent === 1 ? 'mensagem enviada' : 'mensagens enviadas'}
          {queue.skipped > 0 &&
            ` · ${queue.skipped} ${queue.skipped === 1 ? 'pulada' : 'puladas'}`}
          {queue.withoutPhone > 0 && ` · ${queue.withoutPhone} sem telefone`}
        </p>
        <button type="button" className="send-queue-primary" onClick={onClose}>
          Fechar
        </button>
      </section>
    );
  }

  const wasOpened = openedId === client.id;

  function handleOpen() {
    if (!client) return;
    onOpen(client);
    setOpenedId(client.id);
  }

  function handleNext(wasSent: boolean) {
    setOpenedId(null);
    onNext(wasSent);
  }

  return (
    <section
      id="send-queue"
      className="send-queue"
      aria-labelledby="queue-title"
    >
      <div className="send-queue-top">
        <h2 id="queue-title">Fila de envio</h2>
        <span className="send-queue-count">
          {queue.index + 1} de {total}
        </span>
      </div>

      <div
        className="send-queue-bar"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso da fila"
      >
        <div style={{ width: `${progress}%` }} />
      </div>

      {queue.withoutPhone > 0 && queue.index === 0 && (
        <p className="send-queue-warning">
          {queue.withoutPhone === 1
            ? '1 selecionado ficou de fora por não ter telefone.'
            : `${queue.withoutPhone} selecionados ficaram de fora por não ter telefone.`}
        </p>
      )}

      <div className="send-queue-client">
        <span>Agora</span>
        <strong>
          {client.company}
          {client.contactName && ` · ${client.contactName}`}
        </strong>
      </div>

      <p className="send-queue-message">
        {fillTemplate(settings.template, client, settings)}
      </p>

      <button
        type="button"
        className="send-queue-primary"
        onClick={wasOpened ? () => handleNext(true) : handleOpen}
      >
        {wasOpened ? 'Enviei, próximo' : 'Abrir no WhatsApp Web'}
      </button>

      <div className="send-queue-secondary">
        <button type="button" onClick={() => handleNext(false)}>
          Pular
        </button>
        <button type="button" onClick={onClose}>
          Cancelar fila
        </button>
      </div>
    </section>
  );
}
