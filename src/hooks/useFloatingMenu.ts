import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { useClickOutside } from './useClickOutside.ts';

// Menu que "flutua" num portal, posicionado a partir do botão.
// Fica num portal para não ser cortado pela rolagem da tabela.
export function useFloatingMenu(width: number) {
  const [isOpen, setIsOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [refs] = useState(() => [triggerRef, menuRef]);

  const close = useCallback(() => setIsOpen(false), []);
  useClickOutside(refs, close, isOpen);

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const left = Math.max(
      Math.min(rect.left, window.innerWidth - width - 12),
      12,
    );
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Se não cabe embaixo, abre para cima
    if (spaceBelow < 320 && spaceAbove > spaceBelow) {
      setStyle({
        left,
        width,
        bottom: window.innerHeight - rect.top + 8,
        maxHeight: spaceAbove - 20,
      });
    } else {
      setStyle({
        left,
        width,
        top: rect.bottom + 8,
        maxHeight: spaceBelow - 20,
      });
    }
  }, [width]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    document.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, updatePosition]);

  function open() {
    updatePosition();
    setIsOpen(true);
  }

  function toggle() {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  return { isOpen, open, close, toggle, triggerRef, menuRef, style };
}
