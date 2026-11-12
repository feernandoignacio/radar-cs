import { useEffect, useState } from 'react';
import { ClientTable } from './components/ClientTable.tsx';
import type { ContactPatch } from './components/ContactMenu.tsx';
import { GoalCard } from './components/GoalCard.tsx';
import { Header } from './components/Header.tsx';
import { ImportPanel } from './components/ImportPanel.tsx';
import { MessageEditor } from './components/MessageEditor.tsx';
import { SendQueue, type Queue } from './components/SendQueue.tsx';
import { StatusCards } from './components/StatusCards.tsx';
import { StatusFilter, type Filter } from './components/StatusFilter.tsx';
import { SAMPLE_CLIENTS } from './sampleData.ts';
import type { Batch, Client, Status } from './types.ts';
import {
  clientPhone,
  fillTemplate,
  whatsappUrl,
  type MessageSettings,
} from './utils/message.ts';
import {
  clearAll,
  loadBatch,
  loadSettings,
  saveBatch,
  saveSettings,
} from './utils/storage.ts';
import { getSummary } from './utils/summary.ts';
import './App.css';

function App() {
  // Lote salvo no navegador. Se ainda não tem, mostra o exemplo.
  const [savedBatch] = useState(loadBatch);
  const [importedAt, setImportedAt] = useState(savedBatch?.importedAt ?? null);
  const [clients, setClients] = useState<Client[]>(
    savedBatch?.clients ?? SAMPLE_CLIENTS,
  );
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importInfo, setImportInfo] = useState('');
  const [settings, setSettings] = useState(loadSettings);
  const [queue, setQueue] = useState<Queue | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSample = importedAt === null;
  const summary = getSummary(clients);

  // Toda mudança no lote importado fica salva no navegador
  useEffect(() => {
    if (importedAt) {
      const batch: Batch = { importedAt, clients };
      saveBatch(batch);
    }
  }, [importedAt, clients]);
  const visibleClients =
    filter === 'all'
      ? clients
      : clients.filter((client) => client.status === filter);

  function handleStatusChange(id: string, status: Status) {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id
          ? { ...client, status, lastAction: `Status alterado em ${today()}` }
          : client,
      ),
    );
  }

  function handleSettingsChange(next: MessageSettings) {
    setSettings(next);
    saveSettings(next);
  }

  // Abre o WhatsApp Web com a mensagem pronta. Ela só aperta enviar.
  function handleWhatsapp(client: Client) {
    const phone = clientPhone(client);
    if (!phone) return;
    const text = fillTemplate(settings.template, client, settings);
    // Nome fixo da janela: reaproveita a mesma aba do WhatsApp
    window.open(whatsappUrl(phone, text), 'radar-cs-whatsapp');

    // Quem ainda não tinha sido procurado passa para "Tentou, sem sucesso"
    setClients((prev) =>
      prev.map((item) =>
        item.id === client.id
          ? {
              ...item,
              status: item.status === 'not_tried' ? 'tried' : item.status,
              lastAction: `WhatsApp em ${today()}`,
            }
          : item,
      ),
    );
  }

  // Monta a fila com os selecionados, na ordem da tabela
  function handleStartQueue() {
    const selected = clients.filter((client) => selectedIds.has(client.id));
    const withPhone = selected.filter((client) => clientPhone(client));
    setQueue({
      ids: withPhone.map((client) => client.id),
      index: 0,
      sent: 0,
      skipped: 0,
      withoutPhone: selected.length - withPhone.length,
    });
    // No celular a fila fica embaixo da tabela, então rola até ela
    requestAnimationFrame(() =>
      document
        .getElementById('send-queue')
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
    );
  }

  function handleQueueNext(wasSent: boolean) {
    setQueue((prev) =>
      prev
        ? {
            ...prev,
            index: prev.index + 1,
            sent: prev.sent + (wasSent ? 1 : 0),
            skipped: prev.skipped + (wasSent ? 0 : 1),
          }
        : prev,
    );
  }

  function handleQueueClose() {
    // Se terminou a fila, limpa a seleção
    if (queue && queue.index >= queue.ids.length) {
      setSelectedIds(new Set());
    }
    setQueue(null);
  }

  function handleClearData() {
    const ok = window.confirm(
      'Apagar o lote, os contatos digitados e o modelo de mensagem deste navegador? Isso não pode ser desfeito.',
    );
    if (!ok) return;
    clearAll();
    window.location.reload();
  }

  const queueClient = queue
    ? clients.find((client) => client.id === queue.ids[queue.index])
    : undefined;

  function handleContactChange(id: string, patch: ContactPatch) {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id ? { ...client, ...patch } : client,
      ),
    );
  }

  function handleToggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Marca ou desmarca todos os clientes que estão aparecendo no filtro
  function handleToggleAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allVisibleSelected = visibleClients.every((client) =>
        next.has(client.id),
      );
      for (const client of visibleClients) {
        if (allVisibleSelected) {
          next.delete(client.id);
        } else {
          next.add(client.id);
        }
      }
      return next;
    });
  }

  function handleImport(imported: Client[]) {
    setClients(imported);
    setImportedAt(new Date().toISOString());
    setSelectedIds(new Set());
    setFilter('all');
    setIsImportOpen(false);

    const withReason = imported.filter((client) => client.reason).length;
    const withPhone = imported.filter((client) => client.companyPhone).length;
    setImportInfo(
      `${imported.length} empresas importadas · ${withReason} com motivo · ${withPhone} com telefone`,
    );
  }

  const batchName = isSample
    ? 'Dados de exemplo'
    : `Lote importado em ${formatDate(importedAt)}`;

  return (
    <div className="app">
      <Header
        batchName={batchName}
        total={summary.total}
        inReview={summary.inReview}
        onImportClick={() => setIsImportOpen(true)}
        onClearClick={handleClearData}
      />

      {isSample && (
        <p className="app-notice">
          Você está vendo dados de exemplo. Clique em "Importar planilhas" para
          usar o seu lote do mês.
        </p>
      )}

      {importInfo && (
        <p className="app-notice app-notice-success" role="status">
          {importInfo}
          <button
            type="button"
            aria-label="Fechar aviso"
            onClick={() => setImportInfo('')}
          >
            ×
          </button>
        </p>
      )}

      <div className="app-summary">
        <GoalCard summary={summary} />
        <StatusCards summary={summary} />
      </div>

      <div className="app-main">
        <section className="app-clients" aria-label="Clientes do lote">
          <div className="app-clients-toolbar">
            <StatusFilter
              value={filter}
              counts={summary.counts}
              total={clients.length}
              onChange={setFilter}
            />
            <button
              type="button"
              className="app-send-button"
              disabled={selectedIds.size === 0 || queue !== null}
              onClick={handleStartQueue}
            >
              Enviar para {selectedIds.size}{' '}
              {selectedIds.size === 1 ? 'selecionado' : 'selecionados'}
            </button>
          </div>

          <ClientTable
            clients={visibleClients}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            onToggleAll={handleToggleAll}
            onStatusChange={handleStatusChange}
            onContactChange={handleContactChange}
            onWhatsapp={handleWhatsapp}
          />

          <p className="app-clients-footer">
            Mostrando {visibleClients.length} de {clients.length}
          </p>
        </section>

        <aside className="app-aside">
          {queue && (
            <SendQueue
              queue={queue}
              client={queueClient}
              settings={settings}
              onOpen={handleWhatsapp}
              onNext={handleQueueNext}
              onClose={handleQueueClose}
            />
          )}
          <MessageEditor
            settings={settings}
            previewClient={visibleClients[0] ?? clients[0]}
            onChange={handleSettingsChange}
          />
        </aside>
      </div>

      <footer className="app-footer">
        <p>
          Os dados ficam só neste navegador. Nada é enviado para servidores.
        </p>
      </footer>

      {isImportOpen && (
        <ImportPanel
          previous={isSample ? [] : clients}
          hasSavedBatch={!isSample}
          onClose={() => setIsImportOpen(false)}
          onImport={handleImport}
        />
      )}
    </div>
  );
}

// Data de hoje no formato 12/11
function today() {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

function formatDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString('pt-BR') : '';
}

export default App;
