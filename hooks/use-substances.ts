import { useEffect, useMemo, useState } from 'react';

import { SUBSTANCES } from '@/constants/mock-data';
import { fetchMobileSubstances } from '@/lib/api/substances';
import type { Substance } from '@/types/substance';

export type LocalSubstanceSummary = Pick<
  Substance,
  'slug' | 'name' | 'aliases' | 'primaryClass' | 'summary' | 'categories' | 'riskLevel' | 'riskLabel' | 'quickFacts'
>;

export type SubstanceSource = 'live' | 'mixed' | 'local' | 'offline';

export type SubstancesState =
  | { status: 'loading' }
  | { status: 'success'; data: LocalSubstanceSummary[]; source: SubstanceSource; refreshing: boolean };

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

function matchesSummary(substance: LocalSubstanceSummary, query: string): boolean {
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

function mergeSummaries(
  localData: LocalSubstanceSummary[],
  remoteData: LocalSubstanceSummary[],
  query: string,
): LocalSubstanceSummary[] {
  const trimmed = query.trim();
  const remoteBySlug = new Map(remoteData.map((item) => [item.slug, item]));
  const localSlugs = new Set(localData.map((item) => item.slug));

  if (!trimmed) {
    return localData.map((local) => ({
      ...local,
      ...(remoteBySlug.get(local.slug) ?? {}),
      slug: local.slug,
      name: local.name,
    }));
  }

  const relevantRemote = remoteData.filter((item) => matchesSummary(item, trimmed));
  const mergedLocal = localData.map((local) => ({
    ...local,
    ...(remoteBySlug.get(local.slug) ?? {}),
    slug: local.slug,
    name: local.name,
  }));
  const remoteOnly = relevantRemote.filter((item) => !localSlugs.has(item.slug));

  return [...mergedLocal, ...remoteOnly];
}

export function useSubstances(query: string): SubstancesState {
  const localData = useMemo(
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
  const [state, setState] = useState<SubstancesState>({
    status: 'success',
    data: localData,
    source: 'local',
    refreshing: true,
  });

  useEffect(() => {
    let active = true;

    setState({
      status: 'success',
      data: localData,
      source: 'local',
      refreshing: true,
    });

    fetchMobileSubstances(query)
      .then((remoteData) => {
        if (!active) return;
        const mergedData = mergeSummaries(localData, remoteData, query);
        if (mergedData.length === 0 && localData.length > 0) {
          setState({
            status: 'success',
            data: localData,
            source: 'offline',
            refreshing: false,
          });
          return;
        }
        setState({
          status: 'success',
          data: mergedData,
          source: mergedData.length === remoteData.length && localData.length === 0 ? 'live' : 'mixed',
          refreshing: false,
        });
      })
      .catch(() => {
        if (!active) return;
        setState({
          status: 'success',
          data: localData,
          source: 'offline',
          refreshing: false,
        });
      });

    return () => {
      active = false;
    };
  }, [query, localData]);

  return state;
}
