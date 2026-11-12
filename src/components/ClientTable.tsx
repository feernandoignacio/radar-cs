import { useEffect, useRef } from 'react';
import type { Client, Status } from '../types.ts';
import { StatusSelect } from './StatusSelect.tsx';
import './ClientTable.css';

type ClientTableProps = {
  clients: Client[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onStatusChange: (id: string, status: Status) => void;
};

export function ClientTable({
  clients,
  selectedIds,
  onToggle,
  onToggleAll,
  onStatusChange,
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
            <th>Contato</th>
            <th>Motivo do lote</th>
            <th>Status</th>
            <th>Última ação</th>
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
                <td>{client.contactName}</td>
                <td>{client.reason}</td>
                <td>
                  <StatusSelect
                    value={client.status}
                    label={`Status de ${client.company}`}
                    onChange={(status) => onStatusChange(client.id, status)}
                  />
                </td>
                <td className="client-table-muted">{client.lastAction}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
