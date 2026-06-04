import { useEffect, useRef, useState } from 'react';
import type { Substance } from '@/types/substance';
import {
  isApiConfigured,
  getSubstanceDetail as apiGetDetail,
  SynapediaApiError,
} from '@/lib/api/client';
import { normalizeSubstanceDetail } from '@/lib/api/normalize';
import { SUBSTANCES_MAP } from '@/constants/mock-data';

export type SubstanceState =
  | { status: 'loading' }
  | { status: 'success'; data: Substance }
  | { status: 'error'; message: string; notFound?: boolean };

/**
 * Fetch a substance by slug.
 *
 * Strategy:
 * 1. If API is configured → fetch from Synapedia, merge with local enrichment data.
 * 2. If API is not configured → use local mock data.
 * 3. If substance not in mock data and API not configured → error state.
 */
export function useSubstance(slug: string | undefined): SubstanceState {
  const [state, setState] = useState<SubstanceState>({ status: 'loading' });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!slug) {
      setState({ status: 'error', message: 'Ungültige Substanz-ID.', notFound: true });
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ status: 'loading' });

    if (!isApiConfigured()) {
      // Pure local fallback
      const local = SUBSTANCES_MAP[slug];
      if (local) {
        setState({ status: 'success', data: local });
      } else {
        setState({
          status: 'error',
          message: 'Substanz nicht gefunden.',
          notFound: true,
        });
      }
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const raw = await apiGetDetail(slug);
        if (cancelled) return;

        const apiData = raw.data ?? raw.substance;
        if (!apiData) {
          setState({
            status: 'error',
            message: 'Substanz nicht gefunden.',
            notFound: true,
          });
          return;
        }

        // Merge API data with local enrichment (if available)
        const enrichment = SUBSTANCES_MAP[slug] ?? SUBSTANCES_MAP[apiData.slug];
        const substance = normalizeSubstanceDetail(apiData, enrichment);
        setState({ status: 'success', data: substance });
      } catch (err) {
        if (cancelled) return;

        if (err instanceof SynapediaApiError) {
          if (err.code === 'NOT_FOUND') {
            // Try local fallback before giving up
            const local = SUBSTANCES_MAP[slug];
            if (local) {
              setState({ status: 'success', data: local });
              return;
            }
            setState({ status: 'error', message: 'Substanz nicht gefunden.', notFound: true });
            return;
          }
          // Network/server error → try local fallback
          const local = SUBSTANCES_MAP[slug];
          if (local) {
            setState({ status: 'success', data: local });
            return;
          }
          setState({ status: 'error', message: err.message });
          return;
        }

        // Unknown error → try local fallback
        const local = SUBSTANCES_MAP[slug];
        if (local) {
          setState({ status: 'success', data: local });
          return;
        }
        setState({
          status: 'error',
          message: 'Substanz konnte nicht geladen werden. Bitte erneut versuchen.',
        });
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [slug]);

  return state;
}
