import { useMemo } from 'react';

import { SUBSTANCES_MAP } from '@/constants/mock-data';
import type { Substance } from '@/types/substance';

export type SubstanceState =
  | { status: 'loading' }
  | { status: 'success'; data: Substance }
  | { status: 'error'; message: string; notFound?: boolean };

export function useSubstance(slug: string | undefined): SubstanceState {
  return useMemo(() => {
    if (!slug) {
      return {
        status: 'error',
        message: 'Ungueltige Substanz-ID.',
        notFound: true,
      };
    }

    const substance = SUBSTANCES_MAP[slug];
    if (!substance) {
      return {
        status: 'error',
        message: 'Substanz nicht gefunden.',
        notFound: true,
      };
    }

    return { status: 'success', data: substance };
  }, [slug]);
}
