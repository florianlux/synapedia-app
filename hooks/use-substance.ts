import { useEffect, useMemo, useState } from 'react';

import { SUBSTANCES_MAP } from '@/constants/mock-data';
import { fetchMobileSubstanceDetail } from '@/lib/api/substances';
import type { RiskLevel, Substance } from '@/types/substance';
import type { SubstanceSource } from './use-substances';

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
  | { status: 'success'; data: Substance; source: SubstanceSource; refreshing: boolean }
  | { status: 'error'; message: string; notFound?: boolean };

function removeDosage(substance: Substance): Substance {
  return {
    ...substance,
    dosage: { routes: [] },
  };
}

function fallbackToSubstance(fallback: SubstanceDetailFallback): Substance {
  const primaryClass = fallback.primaryClass?.trim() || 'Substanz';
  const riskLevel = fallback.riskLevel ?? 'unknown';

  return {
    slug: fallback.slug,
    name: fallback.name,
    aliases: [],
    chemicalName: '',
    primaryClass,
    summary: fallback.summary || 'Live-Summary aus dem Synapedia Mobile Index. Detaildaten bleiben lokal abgesichert.',
    categories: [primaryClass],
    riskLevel,
    riskLabel: fallback.riskLabel || 'Unbekanntes Risiko',
    riskChips: ['Live-Index'],
    quickFacts: {
      onset: '-',
      peak: '-',
      duration: fallback.duration || '-',
      afterEffects: '-',
    },
    dosage: { routes: [] },
    duration: { phases: [], total: fallback.duration || '-' },
    effects: { positive: [], neutral: [], negative: [] },
    risks: { acute: [], longterm: [] },
    saferUse: [],
    warnings: [],
    mechanisms: [],
    interactions: [],
    interactionsPreview: [],
    sources: [],
    evidenceNote: undefined,
    lastUpdated: '',
  };
}

function getLocalSubstance(slug: string, fallback?: SubstanceDetailFallback | null): Substance | null {
  const local = SUBSTANCES_MAP[slug];
  if (local) return removeDosage(local);
  if (fallback?.slug === slug && fallback.name.trim()) return fallbackToSubstance(fallback);
  return null;
}

function detailUnavailableFallback(substance: Substance): Substance {
  return {
    ...substance,
    summary: 'Für diese Substanz liegen noch keine mobilen Detaildaten vor.',
    effects: { positive: [], neutral: [], negative: [] },
    risks: { acute: [], longterm: [] },
    saferUse: [],
    warnings: [],
    mechanisms: [],
    interactions: [],
    interactionsPreview: [],
    sources: [],
    evidenceNote: undefined,
    lastUpdated: '',
  };
}

export function useSubstance(
  slug: string | undefined,
  fallback?: SubstanceDetailFallback | null,
): SubstanceState {
  const localData = useMemo(() => {
    if (!slug) return null;
    return getLocalSubstance(slug, fallback);
  }, [slug, fallback]);

  const [state, setState] = useState<SubstanceState>(() => {
    if (!slug) {
      return {
        status: 'error',
        message: 'Ungueltige Substanz-ID.',
        notFound: true,
      };
    }

    if (localData) {
      return { status: 'success', data: localData, source: 'local', refreshing: true };
    }

    return { status: 'loading' };
  });

  useEffect(() => {
    let active = true;

    if (!slug) {
      setState({
        status: 'error',
        message: 'Ungueltige Substanz-ID.',
        notFound: true,
      });
      return () => {
        active = false;
      };
    }

    if (localData) {
      setState({ status: 'success', data: localData, source: 'local', refreshing: true });
    } else {
      setState({ status: 'loading' });
    }

    fetchMobileSubstanceDetail(slug, localData ?? undefined)
      .then((result) => {
        if (!active) return;
        setState({
          status: 'success',
          data: removeDosage(result.item),
          source: result.meta.mergedWithLocal ? 'mixed' : 'live',
          refreshing: false,
        });
      })
      .catch(() => {
        if (!active) return;
        if (localData) {
          const fallbackData = SUBSTANCES_MAP[slug]
            ? localData
            : detailUnavailableFallback(localData);
          setState({
            status: 'success',
            data: fallbackData,
            source: 'offline',
            refreshing: false,
          });
          return;
        }

        setState({
          status: 'error',
          message: 'Substanz nicht gefunden.',
          notFound: true,
        });
      });

    return () => {
      active = false;
    };
  }, [slug, localData]);

  return state;
}
