import { useMemo } from 'react';

import { findInteraction } from '@/constants/interactions';
import type { InteractionDetail } from '@/types/interaction';

export type InteractionState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: InteractionDetail }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

export function useInteraction(
  slugA: string | null,
  slugB: string | null,
): InteractionState {
  return useMemo(() => {
    if (!slugA || !slugB) return { status: 'idle' };

    const local = findInteraction(slugA, slugB);
    return local ? { status: 'success', data: local } : { status: 'not_found' };
  }, [slugA, slugB]);
}
