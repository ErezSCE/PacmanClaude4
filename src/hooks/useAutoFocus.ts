import { useEffect, useRef } from 'react';

/**
 * Returns a ref that, once attached to a focusable element, receives
 * keyboard focus as soon as the owning screen mounts. This guarantees
 * keyboard-only users always land on a sensible, visible starting point
 * when a new screen (Start, Pause, Level Complete, Game Over, ...) appears.
 */
export function useAutoFocus<T extends HTMLElement>(): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return ref;
}
