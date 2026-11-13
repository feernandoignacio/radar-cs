import { useCallback, useEffect, useRef, useState } from 'react';
import { Celebration } from './components/Celebration.tsx';
import { ClientTable } from './components/ClientTable.tsx';
import { ConfirmDialog } from './components/ConfirmDialog.tsx';
import type { ContactPatch } from './components/ContactMenu.tsx';
import { GoalCard } from './components/GoalCard.tsx';
import { Header } from './components/Header.tsx';
import { ImportPanel } from './components/ImportPanel.tsx';
import { MessageEditor } from './components/MessageEditor.tsx';
import { NotesCard } from './components/NotesCard.tsx';
import { SendQueue, type Queue } from './components/SendQueue.tsx';
import { SiteFooter } from './components/SiteFooter.tsx';
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
  loadCelebrated,
  loadSettings,
  saveBatch,
  saveCelebrated,
  saveSettings,
} from './utils/storage.ts';
import { playCelebrationSound } from './utils/celebrationSound.ts';
import { makeConfetti, type ConfettiPiece } from './utils/confetti.ts';
import { monthSlug } from './utils/date.ts';
import { exportPdf } from './utils/exportPdf.ts';
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
  const [removedIds, setRemovedIds] = useState<string[]>(
    savedBatch?.removedIds ?? [],
  );
  const [isDeleting, setIsDeleting] = useState(false);
  // Janela de confirmação aberta: excluir uma linha ou limpar tudo
  const [confirm, setConfirm] = useState<
    { kind: 'delete'; client: Client } | { kind: 'clear' } | null
  >(null);
  const closeConfirm = useCallback(() => setConfirm(null), []);
  const [isExporting, setIsExporting] = useState(false);
  // Confetes da comemoração da meta (null = sem festa na tela)
  const [confetti, setConfetti] = useState<ConfettiPiece[] | null>(null);
  const endCelebration = useCallback(() => setConfetti(null), []);
  // Comemoração com os dados de exemplo: vale só até atualizar a página
  const sampleCelebratedRef = useRef(false);
  // Área da página que vira o PDF (tudo, menos o modelo de mensagem)
  const pageRef = useRef<HTMLDivElement>(null);

  const isSample = importedAt === null;
  const summary = getSummary(clients);

  // Toda mudança no lote importado fica salva no navegador
  useEffect(() => {
    if (importedAt) {
      const batch: Batch = { importedAt, clients, removedIds };
      saveBatch(batch);
    }
  }, [importedAt, clients, removedIds]);
  const filteredClients =
    filter === 'all'
      ? clients
      : clients.filter((client) => client.status === filter);
  // Quem já teve a reunião realizada desce para o fim da lista
  const visibleClients = [
    ...filteredClients.filter((client) => client.status !== 'done'),
    ...filteredClients.filter((client) => client.status === 'done'),
  ];

  // Comemora quando a mudança faz o lote bater a meta.
  // Só uma vez por lote: se cair e bater de novo, o card fica verde sem festa.
  function celebrateIfReached(next: Client[]) {
    const wasReached = isGoalReached(clients);
    if (wasReached || !isGoalReached(next)) return;

    // Dados de exemplo resetam ao atualizar a página, e a festa reseta junto.
    // Lote importado: fica salvo que já comemorou.
    if (importedAt) {
      if (loadCelebrated() === importedAt) return;
      saveCelebrated(importedAt);
    } else {
      if (sampleCelebratedRef.current) return;
      sampleCelebratedRef.current = true;
    }

    setConfetti(makeConfetti());
    playCelebrationSound();
  }

  function handleStatusChange(id: string, status: Status) {
    celebrateIfReached(
      clients.map((client) =>
        client.id === id ? { ...client, status } : client,
      ),
    );
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

  async function handlePdf() {
    if (!pageRef.current) return;
    const previousFilter = filter;
    setIsExporting(true);
    setIsDeleting(false);
    // O PDF sai com todos os clientes, mesmo se tiver um filtro ligado
    setFilter('all');

    try {
      // Espera a tela redesenhar sem o filtro antes de tirar a foto
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
      await exportPdf(pageRef.current, `radar-cs-${monthSlug()}.pdf`);
    } finally {
      setFilter(previousFilter);
      setIsExporting(false);
    }
  }

  function handleClearData() {
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

  // Linha nova, toda em branco, no topo da tabela
  function handleAddRow() {
    const client: Client = {
      id: `manual-${Date.now()}`,
      company: '',
      document: '',
      reason: '',
      emails: [],
      companyPhone: '',
      contactName: '',
      whatsapp: '',
      status: 'not_tried',
      lastAction: `Criada em ${today()}`,
      isManual: true,
    };
    setClients((prev) => [client, ...prev]);
    setFilter('all');
    setIsDeleting(false);
  }

  function handleDelete(client: Client) {
    setConfirm({ kind: 'delete', client });
  }

  function confirmDelete(client: Client) {
    setConfirm(null);
    // Tirar uma linha diminui o lote e pode fazer bater a meta
    celebrateIfReached(clients.filter((item) => item.id !== client.id));

    setClients((prev) => prev.filter((item) => item.id !== client.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(client.id);
      return next;
    });
    // Linhas importadas ficam anotadas para não voltarem ao atualizar o lote
    if (!client.isManual) {
      setRemovedIds((prev) => [...prev, client.id]);
    }
    setIsDeleting(false);
  }

  function handleCompanyChange(id: string, company: string) {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id ? { ...client, company } : client,
      ),
    );
  }

  function handleReasonChange(id: string, reason: string) {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id ? { ...client, reason, reasonEdited: true } : client,
      ),
    );
  }

  function handleImport(imported: Client[], keepStatus: boolean) {
    if (!keepStatus) setRemovedIds([]);
    setIsDeleting(false);
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
    <div ref={pageRef} className="app-page">
      <div className="app">
        <Header
          batchName={batchName}
          total={summary.total}
          inReview={summary.inReview}
          onImportClick={() => setIsImportOpen(true)}
          onClearClick={() => setConfirm({ kind: 'clear' })}
          onPdfClick={handlePdf}
          isExporting={isExporting}
        />

        {isSample && (
          <p className="app-notice">
            Você está vendo dados de exemplo. Clique em "Importar planilhas"
            para usar o seu lote do mês.
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

        {/* Topo: meta e cards à esquerda, mensagem e fila à direita.
            Assim a tabela embaixo fica com a largura toda. */}
        <div className="app-top">
          <div className="app-summary">
            <GoalCard summary={summary} />
            <StatusCards summary={summary} />
            <NotesCard />
          </div>

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

        <section className="app-clients" aria-label="Clientes do lote">
          {/* Só aparece no PDF, no lugar da barra de filtros */}
          <h2 className="pdf-only app-clients-title">
            Clientes do lote · {clients.length}
          </h2>

          <div className="app-clients-toolbar">
            <StatusFilter
              value={filter}
              counts={summary.counts}
              total={clients.length}
              onChange={setFilter}
            />
            <div className="app-row-actions">
              <button
                type="button"
                className="app-icon-button app-add-button"
                aria-label="Adicionar linha"
                title="Adicionar linha"
                onClick={handleAddRow}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <button
                type="button"
                className="app-icon-button app-delete-button"
                aria-label="Excluir linha"
                aria-pressed={isDeleting}
                title="Excluir linha"
                onClick={() => setIsDeleting((value) => !value)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
                </svg>
              </button>
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
          </div>

          {isDeleting && (
            <p className="app-delete-notice" role="status">
              Clique na linha que deseja excluir.
              <button type="button" onClick={() => setIsDeleting(false)}>
                Cancelar
              </button>
            </p>
          )}

          <ClientTable
            clients={visibleClients}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            onToggleAll={handleToggleAll}
            onStatusChange={handleStatusChange}
            onContactChange={handleContactChange}
            onWhatsapp={handleWhatsapp}
            onCompanyChange={handleCompanyChange}
            onReasonChange={handleReasonChange}
            isDeleting={isDeleting}
            onDelete={handleDelete}
          />

          <p className="app-clients-footer">
            Mostrando {visibleClients.length} de {clients.length}
          </p>
        </section>

        <footer className="app-footer">
          <p>
            Os dados ficam só neste navegador. Nada é enviado para servidores.
          </p>
        </footer>

        {isImportOpen && (
          <ImportPanel
            previous={isSample ? [] : clients}
            removedIds={removedIds}
            hasSavedBatch={!isSample}
            onClose={() => setIsImportOpen(false)}
            onImport={handleImport}
          />
        )}
        {confirm?.kind === 'delete' && (
          <ConfirmDialog
            title="Excluir linha?"
            message={`${confirm.client.company || 'Esta linha sem nome'} vai sair da lista. Isso não pode ser desfeito.`}
            confirmLabel="Excluir"
            onConfirm={() => confirmDelete(confirm.client)}
            onCancel={closeConfirm}
          />
        )}

        {confirm?.kind === 'clear' && (
          <ConfirmDialog
            title="Limpar todos os dados?"
            message="O lote, os contatos digitados e o modelo de mensagem serão apagados deste navegador. Isso não pode ser desfeito."
            confirmLabel="Limpar tudo"
            onConfirm={handleClearData}
            onCancel={closeConfirm}
          />
        )}
      </div>
      <SiteFooter />
      {confetti && (
        <Celebration confetti={confetti} onDone={endCelebration} />
      )}
    </div>
  );
}

function isGoalReached(list: Client[]) {
  const { total, missingForGoal } = getSummary(list);
  return total > 0 && missingForGoal === 0;
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
