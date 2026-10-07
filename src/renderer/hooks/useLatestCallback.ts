import { useCallback, useLayoutEffect, useRef } from 'react';

/** Stable callback identity for long-lived UI subscriptions and memoized table cells. */
export default function useLatestCallback<Args extends unknown[], Result>(callback: (...args: Args) => Result) {
  const latest = useRef(callback);
  useLayoutEffect(() => {
    latest.current = callback;
  });
  return useCallback((...args: Args) => latest.current(...args), []);
}
