import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useFloatingMenu } from '../hooks/useFloatingMenu.ts';
import { dayKey } from '../utils/date.ts';
import './FloatingMenu.css';
import './DateField.css';

type DateFieldProps = {
  label: string;
  // Dia escolhido no formato 2026-11-20 (vazio = nenhum)
  value: string;
  // Dias antes deste ficam bloqueados
  min?: string;
  // Travado: mostra o texto no lugar da data e não abre o calendário
  disabled?: boolean;
  disabledText?: string;
  onChange: (value: string) => void;
};

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function toLabel(value: string) {
  if (!value) return 'Escolher data';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

// Campo de data com calendário próprio, no estilo dos outros menus do app
// (o calendário do navegador não deixa trocar as setas nem as cores)
export function DateField({
  label,
  value,
  min,
  disabled,
  disabledText,
  onChange,
}: DateFieldProps) {
  const { isOpen, toggle, close, triggerRef, menuRef, style } =
    useFloatingMenu(296);
  // Abre no mês do dia escolhido (ou do mínimo, ou de hoje)
  const [view, setView] = useState(() => {
    const start = value || min || dayKey(new Date());
    const [year, month] = start.split('-').map(Number);
    return { year, month: month - 1 };
  });

  const first = new Date(view.year, view.month, 1);
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const blanks = first.getDay();
  // "dezembro de 2026" vira "Dezembro de 2026"
  const monthText = first.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  const monthName = monthText.charAt(0).toUpperCase() + monthText.slice(1);

  function moveMonth(step: number) {
    setView((prev) => {
      const date = new Date(prev.year, prev.month + step, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  function choose(day: number) {
    onChange(dayKey(new Date(view.year, view.month, day)));
    close();
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={value ? 'date-trigger' : 'date-trigger is-empty'}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`${label}: ${toLabel(value)}`}
        onClick={toggle}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="5" width="16" height="15" rx="3" />
          <path d="M4 10h16M9 3v4M15 3v4" />
        </svg>
        {disabled && disabledText ? disabledText : toLabel(value)}
        <span className="menu-arrow" aria-hidden="true" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="floating-menu date-menu"
            style={style}
            role="dialog"
            aria-label={label}
          >
            <div className="date-head">
              <button
                type="button"
                className="date-nav"
                aria-label="Mês anterior"
                onClick={() => moveMonth(-1)}
              >
                <span className="menu-arrow date-nav-prev" aria-hidden="true" />
              </button>
              <span className="date-month">{monthName}</span>
              <button
                type="button"
                className="date-nav"
                aria-label="Próximo mês"
                onClick={() => moveMonth(1)}
              >
                <span className="menu-arrow date-nav-next" aria-hidden="true" />
              </button>
            </div>

            <div className="date-grid">
              {WEEKDAYS.map((weekday, index) => (
                <span key={index} className="date-weekday" aria-hidden="true">
                  {weekday}
                </span>
              ))}
              {Array.from({ length: blanks }, (_, index) => (
                <span key={`blank-${index}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, index) => {
                const day = index + 1;
                const key = dayKey(new Date(view.year, view.month, day));
                const isSelected = key === value;
                const isDisabled = Boolean(min && key < min);
                return (
                  <button
                    key={key}
                    type="button"
                    className={isSelected ? 'date-day is-selected' : 'date-day'}
                    disabled={isDisabled}
                    aria-pressed={isSelected}
                    onClick={() => choose(day)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
