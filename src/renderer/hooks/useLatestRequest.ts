import { useCallback, useLayoutEffect, useRef } from 'react';
import useLatestCallback from './useLatestCallback';

/** Ignore superseded reads; cancellation does not stop the underlying IPC operation. */
export default function useLatestRequest<Args extends unknown[], Result>(load: (...args: Args) => Promise<Result>, apply: (result: Result) => void) {
  const generation = useRef(0);
  const loadLatest = useLatestCallback(load);
  const applyLatest = useLatestCallback(apply);
  const cancel = useCallback(() => {
    generation.current += 1;
  }, []);
  useLayoutEffect(() => cancel, [cancel]);
  const run = useCallback(
    async (...args: Args) => {
      generation.current += 1;
      const { current } = generation;
      try {
        const result = await loadLatest(...args);
        if (generation.current === current) applyLatest(result);
      } catch (error) {
        if (generation.current === current) throw error;
      }
    },
    [loadLatest, applyLatest],
  );
  return { run, cancel };
}
