import { useCallback, useEffect, useRef, useState } from 'react';
import {
  isApiConfigured,
  searchSubstances as apiSearch,
  SynapediaApiError,
} from '@/lib/api/client';
import {
  normalizeSubstanceSummaries,
  type NormalizedSubstanceSummary,
} from '@/lib/api/normalize';
import { SUBSTANCE_LIST } from '@/constants/interactions';

export type SubstancesState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: NormalizedSubstanceSummary[] }
  | { status: 'error'; message: string };

/**
 * Search substances via Synapedia API with debounce.
 * Falls back to local SUBSTANCE_LIST when API is not configured or query is empty.
 */
export function useSubstances(query: string, debounceMs = 300): SubstancesState {
  const [state, setState] = useState<SubstancesState>({ status: 'idle' });
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetch = useCallback(
    (q: string) => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);

      const trimmed = q.trim();

      // No query → return local list
      if (!trimmed || !isApiConfigured()) {
        const localResults: NormalizedSubstanceSummary[] = SUBSTANCE_LIST.filter((s) => {
          if (!trimmed) return true;
          const lower = trimmed.toLowerCase();
          return (
            s.name.toLowerCase().includes(lower) ||
            s.slug.toLowerCase().includes(lower) ||
            s.categories.some((c) => c.toLowerCase().includes(lower))
          );
        });
        setState({ status: 'success', data: localResults });
        return;
      }

      setState({ status: 'loading' });

      timerRef.current = setTimeout(async () => {
        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const raw = await apiSearch(trimmed);
          if (controller.signal.aborted) return;
          const results = normalizeSubstanceSummaries(raw.data ?? raw.results);
          setState({ status: 'success', data: results });
        } catch (err) {
          if (controller.signal.aborted) return;
          if (err instanceof SynapediaApiError && err.code === 'TIMEOUT') {
            setState({ status: 'error', message: 'Zeitüberschreitung. Bitte erneut versuchen.' });
          } else {
            // Graceful fallback to local data on network error
            const lower = trimmed.toLowerCase();
            const fallback = SUBSTANCE_LIST.filter(
              (s) =>
                s.name.toLowerCase().includes(lower) ||
                s.slug.toLowerCase().includes(lower),
            );
            setState({ status: 'success', data: fallback });
          }
        }
      }, debounceMs);
    },
    [debounceMs],
  );

  useEffect(() => {
    fetch(query);
    return () => {
      abortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, fetch]);

  return state;
}
