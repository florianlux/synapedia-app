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

function sanitizeSubstance(substance: Substance): Substance {
  const primaryClass = substance.primaryClass?.trim() || substance.categories?.[0] || 'Substanz';
  const quickFacts = {
    onset: substance.quickFacts?.onset || '-',
    peak: substance.quickFacts?.peak || '-',
    duration: substance.quickFacts?.duration || '-',
    afterEffects: substance.quickFacts?.afterEffects || '-',
  };
  const duration = {
    phases: Array.isArray(substance.duration?.phases) ? substance.duration.phases : [],
    total: substance.duration?.total || quickFacts.duration,
  };
  const effects = {
    positive: Array.isArray(substance.effects?.positive) ? substance.effects.positive : [],
    neutral: Array.isArray(substance.effects?.neutral) ? substance.effects.neutral : [],
    negative: Array.isArray(substance.effects?.negative) ? substance.effects.negative : [],
  };
  const risks = {
    acute: Array.isArray(substance.risks?.acute) ? substance.risks.acute : [],
    longterm: Array.isArray(substance.risks?.longterm) ? substance.risks.longterm : [],
  };
  const categories = Array.isArray(substance.categories) && substance.categories.length
    ? substance.categories
    : [primaryClass];

  return removeDosage({
    ...substance,
    name: substance.name?.trim() || substance.slug || 'Unbekannte Substanz',
    aliases: Array.isArray(substance.aliases) ? substance.aliases : [],
    chemicalName: substance.chemicalName ?? '',
    primaryClass,
    summary: substance.summary || 'Noch keine Zusammenfassung verfuegbar.',
    categories,
    riskLevel: substance.riskLevel ?? 'unknown',
    riskLabel: substance.riskLabel || 'Unbekanntes Risiko',
    riskChips: Array.isArray(substance.riskChips) && substance.riskChips.length
      ? substance.riskChips
      : categories.slice(0, 3),
    quickFacts,
    duration,
    effects,
    risks,
    saferUse: Array.isArray(substance.saferUse) ? substance.saferUse : [],
    warnings: Array.isArray(substance.warnings) ? substance.warnings : [],
    mechanisms: Array.isArray(substance.mechanisms) ? substance.mechanisms : [],
    interactions: Array.isArray(substance.interactions) ? substance.interactions : [],
    interactionsPreview: Array.isArray(substance.interactionsPreview)
      ? substance.interactionsPreview
      : Array.isArray(substance.interactions)
        ? substance.interactions
        : [],
    sources: Array.isArray(substance.sources) ? substance.sources : [],
    lastUpdated: substance.lastUpdated ?? '',
  });
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
  if (local) return sanitizeSubstance(local);
  if (fallback?.slug === slug && fallback.name.trim()) return sanitizeSubstance(fallbackToSubstance(fallback));
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
            data: sanitizeSubstance(result.item),
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
