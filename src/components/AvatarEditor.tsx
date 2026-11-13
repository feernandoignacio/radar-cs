import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFloatingMenu } from '../hooks/useFloatingMenu.ts';
import { AVATAR_PALETTES } from '../team.ts';
import type { Avatar } from '../utils/storage.ts';
import './FloatingMenu.css';
import './AvatarEditor.css';

type AvatarEditorProps = {
  avatar: Avatar;
  onChange: (avatar: Avatar) => void;
};

// Reduz a foto para um quadrado pequeno, para caber no navegador
function resizePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const size = 320;
      const side = Math.min(image.width, image.height);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      canvas
        .getContext('2d')
        ?.drawImage(
          image,
          (image.width - side) / 2,
          (image.height - side) / 2,
          side,
          side,
          0,
          0,
          size,
          size,
        );
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível abrir essa imagem.'));
    };
    image.src = url;
  });
}

// Lápis no canto do avatar: troca a foto ou a cor
export function AvatarEditor({ avatar, onChange }: AvatarEditorProps) {
  const { isOpen, toggle, close, triggerRef, menuRef, style } =
    useFloatingMenu(240);
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError('');
    try {
      const photo = await resizePhoto(file);
      onChange({ ...avatar, photo });
      close();
    } catch (problem) {
      setError((problem as Error).message);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="avatar-edit"
        aria-label="Mudar a imagem do perfil"
        title="Mudar a imagem do perfil"
        aria-expanded={isOpen}
        onClick={toggle}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
        </svg>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="floating-menu avatar-menu"
            style={style}
          >
            <button
              type="button"
              className="menu-option"
              onClick={() => fileRef.current?.click()}
            >
              Escolher foto
            </button>
            {avatar.photo && (
              <button
                type="button"
                className="menu-option"
                onClick={() => {
                  onChange({ palette: avatar.palette });
                  close();
                }}
              >
                Tirar foto
              </button>
            )}

            <p className="avatar-menu-label">Ou escolha uma cor</p>
            <div className="avatar-swatches">
              {AVATAR_PALETTES.map(([from, to], index) => (
                <button
                  key={from}
                  type="button"
                  className="avatar-swatch"
                  aria-label={`Cor ${index + 1}`}
                  aria-pressed={!avatar.photo && avatar.palette === index}
                  style={{
                    background: `linear-gradient(135deg, ${from}, ${to})`,
                  }}
                  onClick={() => {
                    onChange({ palette: index });
                    close();
                  }}
                />
              ))}
            </div>

            {error && (
              <p className="avatar-error" role="alert">
                {error}
              </p>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                void handleFile(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
