import { useEffect, useRef, useState } from 'react';
import type { InteractionDetail } from '@/types/interaction';
import {
  isApiConfigured,
  checkInteraction as apiCheck,
  SynapediaApiError,
} from '@/lib/api/client';
import { normalizeInteractionCheckData } from '@/lib/api/normalize';
import { findInteraction } from '@/constants/interactions';

export type InteractionState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: InteractionDetail }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

/**
 * Fetch the interaction between two substances.
 *
 * Strategy:
 * 1. If API configured → call /interaction-check, return first pair.
 * 2. On API failure or unconfigured → fall back to local INTERACTIONS data.
 * 3. If neither has data → not_found state.
 */
export function useInteraction(
  slugA: string | null,
  slugB: string | null,
): InteractionState {
  const [state, setState] = useState<InteractionState>({ status: 'idle' });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!slugA || !slugB) {
      setState({ status: 'idle' });
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setState({ status: 'loading' });

    let cancelled = false;

    (async () => {
      if (!isApiConfigured()) {
        const local = findInteraction(slugA, slugB);
        if (!cancelled) {
          setState(local ? { status: 'success', data: local } : { status: 'not_found' });
        }
        return;
      }

      try {
        const raw = await apiCheck([slugA, slugB]);
        if (cancelled) return;

        const checkData = raw.data;
        if (!checkData || !checkData.interactions?.length) {
          // Try local fallback
          const local = findInteraction(slugA, slugB);
          setState(local ? { status: 'success', data: local } : { status: 'not_found' });
          return;
        }

        const interactions = normalizeInteractionCheckData(checkData);
        const first = interactions[0];
        if (!first) {
          const local = findInteraction(slugA, slugB);
          setState(local ? { status: 'success', data: local } : { status: 'not_found' });
          return;
        }

        setState({ status: 'success', data: first });
      } catch (err) {
        if (cancelled) return;

        // Any error → try local fallback
        const local = findInteraction(slugA, slugB);
        if (local) {
          setState({ status: 'success', data: local });
          return;
        }

        if (err instanceof SynapediaApiError && err.code === 'NOT_FOUND') {
          setState({ status: 'not_found' });
          return;
        }

        setState({
          status: 'error',
          message:
            err instanceof SynapediaApiError
              ? err.message
              : 'Interaktion konnte nicht geladen werden.',
        });
      }
    })();

    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [slugA, slugB]);

  return state;
}
