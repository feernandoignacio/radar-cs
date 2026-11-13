import { createPortal } from 'react-dom';
import { useFloatingMenu } from '../hooks/useFloatingMenu.ts';
import type { Colleague } from '../team.ts';
import './FloatingMenu.css';
import './PersonSelect.css';

type PersonSelectProps = {
  label: string;
  people: Colleague[];
  value: string;
  onChange: (id: string) => void;
};

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
}

// Lista de colegas no estilo dos outros menus do app, com o avatar de cada um
export function PersonSelect({
  label,
  people,
  value,
  onChange,
}: PersonSelectProps) {
  const { isOpen, toggle, close, triggerRef, menuRef, style } =
    useFloatingMenu(300);
  const selected = people.find((person) => person.id === value);

  function choose(id: string) {
    onChange(id);
    close();
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="person-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label}: ${selected?.name ?? 'ninguém'}`}
        onClick={toggle}
      >
        {selected && (
          <span
            className="person-avatar"
            style={{
              background: `linear-gradient(135deg, ${selected.color}, ${selected.colorTo})`,
            }}
            aria-hidden="true"
          >
            {initialsOf(selected.name)}
          </span>
        )}
        {selected?.name ?? 'Escolher'}
        <span className="menu-arrow" aria-hidden="true" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="floating-menu person-menu"
            style={style}
          >
            <ul className="person-options" role="listbox" aria-label={label}>
              {people.map((person) => (
                <li
                  key={person.id}
                  role="option"
                  aria-selected={person.id === value}
                >
                  <button
                    type="button"
                    className={
                      person.id === value
                        ? 'menu-option selected'
                        : 'menu-option'
                    }
                    onClick={() => choose(person.id)}
                  >
                    <span
                      className="person-avatar"
                      style={{
                        background: `linear-gradient(135deg, ${person.color}, ${person.colorTo})`,
                      }}
                      aria-hidden="true"
                    >
                      {initialsOf(person.name)}
                    </span>
                    {person.name}
                    {person.id === value && (
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
