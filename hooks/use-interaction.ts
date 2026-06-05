import { useEffect, useState } from 'react';

import { findInteraction } from '@/constants/interactions';
import { fetchMobileInteractionCheck } from '@/lib/api/interactions';
import type { InteractionDetail } from '@/types/interaction';

export type InteractionSource = 'live' | 'local' | 'offline';

export type InteractionState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: InteractionDetail; source: InteractionSource; refreshing: boolean }
  | { status: 'not_found'; source?: InteractionSource; refreshing?: boolean }
  | { status: 'error'; message: string };

export function useInteraction(
  slugA: string | null,
  slugB: string | null,
): InteractionState {
  const [state, setState] = useState<InteractionState>({ status: 'idle' });

  useEffect(() => {
    let active = true;

    if (!slugA || !slugB) {
      setState({ status: 'idle' });
      return () => {
        active = false;
      };
    }

    const local = findInteraction(slugA, slugB);
    if (local) {
      setState({ status: 'success', data: local, source: 'local', refreshing: true });
    } else {
      setState({ status: 'loading' });
    }

    fetchMobileInteractionCheck(slugA, slugB)
      .then((remote) => {
        if (!active) return;
        if (!remote) {
          setState({ status: 'not_found', source: 'live', refreshing: false });
          return;
        }

        setState({
          status: 'success',
          data: remote,
          source: 'live',
          refreshing: false,
        });
      })
      .catch(() => {
        if (!active) return;
        if (local) {
          setState({ status: 'success', data: local, source: 'offline', refreshing: false });
          return;
        }
        setState({ status: 'not_found', source: 'offline', refreshing: false });
      });

    return () => {
      active = false;
    };
  }, [slugA, slugB]);

  return state;
}
