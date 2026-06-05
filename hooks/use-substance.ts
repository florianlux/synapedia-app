import { useMemo } from 'react';

import { SUBSTANCES_MAP } from '@/constants/mock-data';
import type { RiskLevel, Substance } from '@/types/substance';

export type SubstanceDetailFallback = {
  slug: string;
  name: string;
  primaryClass?: string;
  summary?: string;
  duration?: string;
  riskLevel?: RiskLevel;
  riskLabel?: string;
};

export type SubstanceState =
  | { status: 'loading' }
  | { status: 'success'; data: Substance }
  | { status: 'error'; message: string; notFound?: boolean };

function fallbackToSubstance(fallback: SubstanceDetailFallback): Substance {
  const primaryClass = fallback.primaryClass?.trim() || 'Substanz';
  const riskLevel = fallback.riskLevel ?? 'unknown';

  return {
    slug: fallback.slug,
    name: fallback.name,
    aliases: [],
    chemicalName: '',
    primaryClass,
    summary: fallback.summary || 'Live-Summary aus dem Synapedia Labs Index. Detaildaten bleiben in diesem Sprint lokal.',
    categories: [primaryClass],
    riskLevel,
    riskLabel: fallback.riskLabel || 'Unbekanntes Risiko',
    riskChips: ['Live-Index'],
    quickFacts: {
      onset: '—',
      peak: '—',
      duration: fallback.duration || '—',
      afterEffects: '—',
    },
    dosage: { routes: [] },
    duration: { phases: [], total: fallback.duration || '—' },
    effects: { positive: [], neutral: [], negative: [] },
    risks: { acute: [], longterm: [] },
    saferUse: [],
    interactions: [],
    sources: [],
    lastUpdated: '',
  };
}

export function useSubstance(
  slug: string | undefined,
  fallback?: SubstanceDetailFallback | null,
): SubstanceState {
  return useMemo(() => {
    if (!slug) {
      return {
        status: 'error',
        message: 'Ungueltige Substanz-ID.',
        notFound: true,
      };
    }

    const substance = SUBSTANCES_MAP[slug];
    if (!substance && fallback?.slug === slug && fallback.name.trim()) {
      return { status: 'success', data: fallbackToSubstance(fallback) };
    }

    if (!substance) {
      return {
        status: 'error',
        message: 'Substanz nicht gefunden.',
        notFound: true,
      };
    }

    return { status: 'success', data: substance };
  }, [slug, fallback]);
}
