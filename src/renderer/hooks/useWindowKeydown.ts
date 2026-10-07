import { useEffect, useRef } from 'react';

/** Keep one subscription while reading the latest render's callback. */
export default function useWindowKeydown(enabled: boolean, handler: (event: KeyboardEvent) => void) {
  const latest = useRef(handler);
  useEffect(() => {
    latest.current = handler;
  });
  useEffect(() => {
    if (!enabled) return undefined;
    const listener = (event: KeyboardEvent) => latest.current(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [enabled]);
}
