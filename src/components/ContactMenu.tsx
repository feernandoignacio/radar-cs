import { useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useFloatingMenu } from '../hooks/useFloatingMenu.ts';
import type { Client } from '../types.ts';
import './FloatingMenu.css';
import './ContactMenu.css';

export type ContactPatch = Pick<Client, 'contactName' | 'whatsapp'>;

type ContactMenuProps = {
  client: Client;
  onSave: (patch: ContactPatch) => void;
};

export function ContactMenu({ client, onSave }: ContactMenuProps) {
  const { isOpen, toggle, close, triggerRef, menuRef, style } =
    useFloatingMenu(340);
  const [name, setName] = useState(client.contactName);
  const [whatsapp, setWhatsapp] = useState(client.whatsapp);
  const [copied, setCopied] = useState('');

  function handleToggle() {
    if (!isOpen) {
      // Abre sempre com os valores salvos
      setName(client.contactName);
      setWhatsapp(client.whatsapp);
    }
    toggle();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave({ contactName: name.trim(), whatsapp: whatsapp.trim() });
    close();
  }

  async function handleCopy(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(email);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      // Sem permissão de área de transferência: não faz nada
    }
  }

  const title = client.contactName || client.emails[0] || 'Sem contato';
  const phone = client.whatsapp || client.companyPhone;
  const menuId = `contacts-${client.id}`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="contact-button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={`Contatos de ${client.company || 'nova empresa'}`}
        onClick={handleToggle}
      >
        <span className="contact-button-texts">
          <span className="contact-button-title">{title}</span>
          <small
            className={
              client.whatsapp ? 'is-whatsapp' : phone ? undefined : 'is-missing'
            }
          >
            {client.whatsapp
              ? `WhatsApp ${client.whatsapp}`
              : phone || 'Telefone não encontrado'}
          </small>
        </span>
        <span className="menu-arrow" aria-hidden="true" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            className="floating-menu contact-menu"
            style={style}
          >
            <form className="contact-form" onSubmit={handleSubmit}>
              <p className="contact-section">Contato principal</p>
              <label>
                Nome
                <input
                  value={name}
                  placeholder="Quem você vai procurar"
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label>
                WhatsApp
                <input
                  type="tel"
                  inputMode="tel"
                  value={whatsapp}
                  placeholder="(11) 91234-5678"
                  onChange={(event) => setWhatsapp(event.target.value)}
                />
              </label>
              <button type="submit" className="contact-save">
                Salvar
              </button>
            </form>

            <div className="contact-block">
              <p className="contact-section">Telefone da empresa</p>
              {client.companyPhone ? (
                <div className="contact-row">
                  <span>{client.companyPhone}</span>
                  <button
                    type="button"
                    className="contact-link"
                    onClick={() => setWhatsapp(client.companyPhone)}
                  >
                    Usar no WhatsApp
                  </button>
                </div>
              ) : (
                <p className="contact-missing">Telefone não encontrado</p>
              )}
            </div>

            <div className="contact-block">
              <p className="contact-section">
                Emails da base ({client.emails.length})
              </p>
              {client.emails.length === 0 ? (
                <p className="contact-missing">Nenhum email encontrado</p>
              ) : (
                <ul className="contact-emails">
                  {client.emails.map((email) => (
                    <li key={email} className="contact-row">
                      <span className="contact-email">{email}</span>
                      <button
                        type="button"
                        className="contact-link"
                        onClick={() => handleCopy(email)}
                      >
                        {copied === email ? 'Copiado!' : 'Copiar'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
