import { useEffect, type RefObject } from 'react';

// Chama onOutside quando clicar fora de todos os elementos passados.
// Recebe uma lista porque o menu fica num portal, longe do botão.
export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  onOutside: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;

    function handlePointer(event: PointerEvent) {
      const target = event.target as Node;
      const isInside = refs.some((ref) => ref.current?.contains(target));
      if (!isInside) onOutside();
    }

    document.addEventListener('pointerdown', handlePointer);
    return () => document.removeEventListener('pointerdown', handlePointer);
  }, [refs, onOutside, enabled]);
}
