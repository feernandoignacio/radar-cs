import { useEffect, useRef } from 'react';
import type { Client, Status } from '../types.ts';
import { clientPhone } from '../utils/message.ts';
import { ContactMenu, type ContactPatch } from './ContactMenu.tsx';
import { StatusSelect } from './StatusSelect.tsx';
import './ClientTable.css';

type ClientTableProps = {
  clients: Client[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onStatusChange: (id: string, status: Status) => void;
  onContactChange: (id: string, patch: ContactPatch) => void;
  onWhatsapp: (client: Client) => void;
};

export function ClientTable({
  clients,
  selectedIds,
  onToggle,
  onToggleAll,
  onStatusChange,
  onContactChange,
  onWhatsapp,
}: ClientTableProps) {
  const selectAllRef = useRef<HTMLInputElement>(null);
  const selectedHere = clients.filter((client) =>
    selectedIds.has(client.id),
  ).length;
  const allSelected = clients.length > 0 && selectedHere === clients.length;

  // Checkbox do cabeçalho fica "meio marcado" quando só alguns estão selecionados
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedHere > 0 && !allSelected;
    }
  }, [selectedHere, allSelected]);

  if (clients.length === 0) {
    return (
      <p className="client-table-empty">Nenhum cliente com esse status.</p>
    );
  }

  return (
    <div className="client-table-scroll">
      <table className="client-table">
        <thead>
          <tr>
            <th className="client-table-check">
              <input
                ref={selectAllRef}
                type="checkbox"
                aria-label="Selecionar todos da lista"
                checked={allSelected}
                onChange={onToggleAll}
              />
            </th>
            <th>Empresa</th>
            <th>Motivo do lote</th>
            <th>Contatos</th>
            <th>Status</th>
            <th>Última ação</th>
            <th className="client-table-actions">Ações</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const isSelected = selectedIds.has(client.id);

            return (
              <tr
                key={client.id}
                className={isSelected ? 'is-selected' : undefined}
              >
                <td className="client-table-check">
                  <input
                    type="checkbox"
                    aria-label={`Selecionar ${client.company}`}
                    checked={isSelected}
                    onChange={() => onToggle(client.id)}
                  />
                </td>
                <td className="client-table-company">{client.company}</td>
                <td className="client-table-reason">
                  {client.reason || 'Sem motivo na planilha'}
                </td>
                <td>
                  <ContactMenu
                    client={client}
                    onSave={(patch) => onContactChange(client.id, patch)}
                  />
                </td>
                <td>
                  <StatusSelect
                    value={client.status}
                    label={`Status de ${client.company}`}
                    onChange={(status) => onStatusChange(client.id, status)}
                  />
                </td>
                <td className="client-table-muted">{client.lastAction}</td>
                <td className="client-table-actions">
                  <button
                    type="button"
                    className="whatsapp-button"
                    disabled={!clientPhone(client)}
                    title={
                      clientPhone(client)
                        ? 'Abrir no WhatsApp Web com a mensagem pronta'
                        : 'Adicione um WhatsApp na coluna Contatos'
                    }
                    aria-label={`Enviar WhatsApp para ${client.company}`}
                    onClick={() => onWhatsapp(client)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
