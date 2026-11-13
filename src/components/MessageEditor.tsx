import { useRef } from 'react';
import type { Client } from '../types.ts';
import {
  DEFAULT_SETTINGS,
  VARIABLES,
  fillTemplate,
  type MessageSettings,
} from '../utils/message.ts';
import './MessageEditor.css';

type MessageEditorProps = {
  settings: MessageSettings;
  previewClient: Client | undefined;
  onChange: (settings: MessageSettings) => void;
};

// Sem cliente selecionado, a prévia mostra os nomes das variáveis
const EXAMPLE_CLIENT: Client = {
  id: 'exemplo',
  company: '[empresa]',
  document: '',
  reason: '',
  emails: [],
  companyPhone: '',
  contactName: '[contato]',
  whatsapp: '',
  status: 'not_tried',
  lastAction: '',
};

export function MessageEditor({
  settings,
  previewClient,
  onChange,
}: MessageEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function update(patch: Partial<MessageSettings>) {
    onChange({ ...settings, ...patch });
  }

  // Coloca a variável onde está o cursor do texto
  function insertVariable(variable: string) {
    const textarea = textareaRef.current;
    // Se o campo não estava selecionado, coloca no final do texto
    const hasCursor = textarea !== null && document.activeElement === textarea;
    const start = hasCursor
      ? textarea.selectionStart
      : settings.template.length;
    const end = hasCursor ? textarea.selectionEnd : settings.template.length;
    const template =
      settings.template.slice(0, start) +
      variable +
      settings.template.slice(end);
    update({ template });

    // Depois que o React atualizar, devolve o foco com o cursor no lugar
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(
        start + variable.length,
        start + variable.length,
      );
    });
  }

  return (
    <section className="message-editor" aria-labelledby="message-title">
      <h2 id="message-title">Modelo da mensagem</h2>

      <div className="message-fields">
        <label>
          Seu nome
          <input
            value={settings.myName}
            placeholder="Como você assina"
            onChange={(event) => update({ myName: event.target.value })}
          />
        </label>
        <label>
          Link da agenda
          <input
            type="url"
            value={settings.scheduleLink}
            placeholder="https://..."
            onChange={(event) => update({ scheduleLink: event.target.value })}
          />
        </label>
      </div>

      <label className="message-template">
        Mensagem
        <textarea
          ref={textareaRef}
          rows={6}
          value={settings.template}
          onChange={(event) => update({ template: event.target.value })}
        />
      </label>

      <div className="message-variables">
        <span>Inserir:</span>
        {VARIABLES.map((variable) => (
          <button
            key={variable}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => insertVariable(variable)}
          >
            {variable}
          </button>
        ))}
        <button
          type="button"
          className="message-reset"
          onClick={() => update({ template: DEFAULT_SETTINGS.template })}
        >
          Voltar ao padrão
        </button>
      </div>

      <div className="message-preview">
        <p className="message-preview-label">
          {previewClient
            ? `Prévia para ${previewClient.company || 'linha sem nome'}`
            : 'Prévia · selecione um cliente para ver com os dados dele'}
        </p>
        <p className="message-preview-text">
          {fillTemplate(
            settings.template,
            previewClient ?? EXAMPLE_CLIENT,
            settings,
          )}
        </p>
      </div>
    </section>
  );
}
