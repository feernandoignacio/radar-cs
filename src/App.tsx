import { useEffect, useState } from 'react';
import { ClientTable } from './components/ClientTable.tsx';
import type { ContactPatch } from './components/ContactMenu.tsx';
import { GoalCard } from './components/GoalCard.tsx';
import { Header } from './components/Header.tsx';
import { ImportPanel } from './components/ImportPanel.tsx';
import { StatusCards } from './components/StatusCards.tsx';
import { StatusFilter, type Filter } from './components/StatusFilter.tsx';
import { SAMPLE_CLIENTS } from './sampleData.ts';
import type { Batch, Client, Status } from './types.ts';
import { loadBatch, saveBatch } from './utils/storage.ts';
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
        onImportClick={() => setIsImportOpen(true)}
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

      <section className="app-clients" aria-label="Clientes do lote">
        <div className="app-clients-toolbar">
          <StatusFilter
            value={filter}
            counts={summary.counts}
            total={summary.total}
            onChange={setFilter}
          />
          {/* O envio em fila ganha função na parte 5 */}
          <button
            type="button"
            className="app-send-button"
            disabled={selectedIds.size === 0}
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
        />

        <p className="app-clients-footer">
          Mostrando {visibleClients.length} de {summary.total}
        </p>
      </section>

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
