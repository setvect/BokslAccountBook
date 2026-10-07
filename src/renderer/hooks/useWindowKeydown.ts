import { RefObject, useEffect } from 'react';
import useLatestCallback from './useLatestCallback';

/** A single subscription reading the latest callback, restricted to the active dialog. */
export default function useWindowKeydown(enabled: boolean, handler: (event: KeyboardEvent) => void, scope?: RefObject<HTMLElement>) {
  const latest = useLatestCallback(handler);
  useEffect(() => {
    if (!enabled) return undefined;
    const listener = (event: KeyboardEvent) => {
      if (event.defaultPrevented || document.querySelector('.swal2-container')) return;
      const owner = scope?.current?.closest('.modal');
      if (owner) {
        const dialogs = Array.from(document.querySelectorAll('.modal.show')).filter((dialog) => dialog.getAttribute('aria-hidden') !== 'true');
        if (dialogs[dialogs.length - 1] !== owner) return;
      }
      latest(event);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [enabled, latest, scope]);
}
