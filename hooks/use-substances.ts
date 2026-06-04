import { useMemo } from 'react';

import { SUBSTANCES } from '@/constants/mock-data';
import type { Substance } from '@/types/substance';

export type LocalSubstanceSummary = Pick<
  Substance,
  'slug' | 'name' | 'aliases' | 'primaryClass' | 'summary' | 'categories' | 'riskLevel' | 'riskLabel' | 'quickFacts'
>;

export type SubstancesState =
  | { status: 'loading' }
  | { status: 'success'; data: LocalSubstanceSummary[] };

function matchesSubstance(substance: Substance, query: string): boolean {
  const term = query.trim().toLowerCase();
  if (!term) return true;

  const haystack = [
    substance.name,
    substance.slug,
    substance.primaryClass,
    substance.summary,
    ...substance.categories,
    ...(substance.aliases ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(term);
}

export function useSubstances(query: string): SubstancesState {
  const data = useMemo(
    () =>
      SUBSTANCES.filter((substance) => matchesSubstance(substance, query)).map(
        ({
          slug,
          name,
          aliases,
          primaryClass,
          summary,
          categories,
          riskLevel,
          riskLabel,
          quickFacts,
        }) => ({
          slug,
          name,
          aliases,
          primaryClass,
          summary,
          categories,
          riskLevel,
          riskLabel,
          quickFacts,
        }),
      ),
    [query],
  );

  return { status: 'success', data };
}
