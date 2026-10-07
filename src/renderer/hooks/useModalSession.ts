import { useCallback, useEffect, useRef, useState } from 'react';
import { showWarnDialog } from '../components/util/util';

/** A new open/close invalidates old reads; the synchronous save lock also covers form validation. */
export default function useModalSession() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const locked = useRef(false);
  const active = useRef(false);
  const mounted = useRef(true);
  const canSave = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      active.current = false;
      generation.current += 1;
    };
  }, []);
  const close = useCallback(() => {
    generation.current += 1;
    active.current = false;
    canSave.current = false;
    setShow(false);
    setLoading(false);
  }, []);
  const open = useCallback(async <T>(initialize: () => void, load?: () => Promise<T>, apply?: (value: T) => void) => {
    generation.current += 1;
    const version = generation.current;
    active.current = true;
    canSave.current = !load;
    setShow(true);
    setError('');
    setReady(!load);
    setLoading(!!load);
    initialize();
    if (!load) return;
    try {
      const value = await load();
      if (mounted.current && version === generation.current) {
        apply?.(value);
        canSave.current = true;
        setReady(true);
      }
    } catch (failure) {
      if (mounted.current && version === generation.current) setError(failure instanceof Error ? failure.message : '조회에 실패했습니다.');
    } finally {
      if (mounted.current && version === generation.current) setLoading(false);
    }
  }, []);
  const submit = async (action: (isCurrent: () => boolean) => Promise<void>) => {
    if (locked.current || !active.current || !canSave.current) return;
    locked.current = true;
    setSaving(true);
    setError('');
    const version = generation.current;
    const isCurrent = () => mounted.current && version === generation.current;
    try {
      await action(isCurrent);
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : '저장에 실패했습니다.';
      if (isCurrent()) setError(message);
      else if (mounted.current) showWarnDialog(message);
    } finally {
      locked.current = false;
      if (mounted.current) setSaving(false);
    }
  };
  return { show, loading, saving, ready, error, open, close, submit, disabled: loading || saving || !ready };
}
