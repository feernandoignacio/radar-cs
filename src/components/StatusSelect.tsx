import { STATUS_INFO, STATUS_ORDER } from '../status.ts';
import type { Status } from '../types.ts';
import './StatusSelect.css';

type StatusSelectProps = {
  value: Status;
  label: string;
  onChange: (status: Status) => void;
};

// Select nativo com cara de etiqueta: funciona com teclado e no celular
export function StatusSelect({ value, label, onChange }: StatusSelectProps) {
  const info = STATUS_INFO[value];

  return (
    <select
      className="status-select"
      aria-label={label}
      value={value}
      style={{ backgroundColor: info.pillBg, color: info.pillText }}
      onChange={(event) => onChange(event.target.value as Status)}
    >
      {STATUS_ORDER.map((status) => (
        <option key={status} value={status}>
          {STATUS_INFO[status].label}
        </option>
      ))}
    </select>
  );
}
