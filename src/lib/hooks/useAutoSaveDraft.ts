import { useEffect, useRef, useState } from 'react';
import { saveDraft, loadDraft, SaveStatus } from '../utils/draftStorage';

interface AutoSaveOptions<T> {
  key: string; // localStorage key
  data: T; // data to persist
  delay?: number; // debounce ms
  enabled?: boolean; // feature flag
  onHydrate?: (data: T) => void; // called with existing draft
}

export function useAutoSaveDraft<T>({ key, data, delay = 600, enabled = true, onHydrate }: AutoSaveOptions<T>) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timeoutRef = useRef<number | null>(null);
  const firstRunRef = useRef(true);

  // Hydrate once
  useEffect(() => {
    if (!enabled) return;
    const { data: existing } = loadDraft<T>(key);
    if (existing && onHydrate) {
      onHydrate(existing);
    }
    // after hydration mark first run false so next changes trigger save
    firstRunRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (firstRunRef.current) return; // skip initial render
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setStatus('saving');
    timeoutRef.current = window.setTimeout(() => {
      try {
        saveDraft(key, data);
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      } catch (e) {
        setStatus('error');
      }
    }, delay);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [data, key, delay, enabled]);

  return { status };
}
