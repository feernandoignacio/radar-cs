import { useState } from 'react';
import { ClientTable } from './components/ClientTable.tsx';
import { GoalCard } from './components/GoalCard.tsx';
import { Header } from './components/Header.tsx';
import { StatusCards } from './components/StatusCards.tsx';
import { StatusFilter, type Filter } from './components/StatusFilter.tsx';
import { SAMPLE_CLIENTS } from './sampleData.ts';
import type { Status } from './types.ts';
import { getSummary } from './utils/summary.ts';
import './App.css';

function App() {
  // Por enquanto usa os dados de exemplo. Na parte 3 vem do CSV.
  const [clients, setClients] = useState(SAMPLE_CLIENTS);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const summary = getSummary(clients);
  const visibleClients =
    filter === 'all'
      ? clients
      : clients.filter((client) => client.status === filter);

  function handleStatusChange(id: string, status: Status) {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id
          ? { ...client, status, lastAction: 'Status alterado agora' }
          : client,
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

  return (
    <div className="app">
      <Header batchName="Lote de exemplo" total={summary.total} />

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
        />

        <p className="app-clients-footer">
          Mostrando {visibleClients.length} de {summary.total}
        </p>
      </section>
    </div>
  );
}

export default App;
