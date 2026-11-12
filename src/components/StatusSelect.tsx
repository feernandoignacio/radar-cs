import { createPortal } from 'react-dom';
import { useFloatingMenu } from '../hooks/useFloatingMenu.ts';
import { STATUS_INFO, STATUS_ORDER } from '../status.ts';
import type { Status } from '../types.ts';
import './FloatingMenu.css';
import './StatusSelect.css';

type StatusSelectProps = {
  value: Status;
  label: string;
  onChange: (status: Status) => void;
};

// Etiqueta colorida que abre a lista de status, no estilo do seletor de idiomas
export function StatusSelect({ value, label, onChange }: StatusSelectProps) {
  const { isOpen, toggle, close, triggerRef, menuRef, style } =
    useFloatingMenu(230);
  const info = STATUS_INFO[value];

  function choose(status: Status) {
    if (status !== value) onChange(status);
    close();
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="status-trigger"
        style={{ backgroundColor: info.pillBg, color: info.pillText }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label}: ${info.label}`}
        onClick={toggle}
      >
        {info.label}
        <span className="menu-arrow" aria-hidden="true" />
      </button>

      {isOpen &&
        createPortal(
          <div ref={menuRef} className="floating-menu" style={style}>
            <ul className="status-options" role="listbox" aria-label={label}>
              {STATUS_ORDER.map((status) => (
                <li key={status} role="option" aria-selected={status === value}>
                  <button
                    type="button"
                    className={
                      status === value ? 'menu-option selected' : 'menu-option'
                    }
                    onClick={() => choose(status)}
                  >
                    <span
                      className="menu-dot"
                      style={{ background: STATUS_INFO[status].dot }}
                    />
                    {STATUS_INFO[status].label}
                    {status === value && (
                      <svg
                        className="menu-check"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M5 12l5 5 9-10" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
}
