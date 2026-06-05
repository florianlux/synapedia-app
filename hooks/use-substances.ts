import { useEffect, useMemo, useState } from 'react';

import { SUBSTANCES } from '@/constants/mock-data';
import { fetchMobileSubstanceList, type ApiSubstanceListMeta } from '@/lib/api/substances';
import type { Substance } from '@/types/substance';

export type LocalSubstanceSummary = Pick<
  Substance,
  'slug' | 'name' | 'aliases' | 'primaryClass' | 'summary' | 'categories' | 'riskLevel' | 'riskLabel' | 'quickFacts'
>;

export type SubstanceSource = 'live' | 'mixed' | 'local' | 'offline';

export type SubstanceCatalogPagination = {
  available: boolean;
  hasMore: boolean;
};

export type SubstancesState =
  | { status: 'loading' }
  | {
      status: 'success';
      data: LocalSubstanceSummary[];
      curated: LocalSubstanceSummary[];
      liveCatalog: LocalSubstanceSummary[];
      searchResults: LocalSubstanceSummary[];
      source: SubstanceSource;
      refreshing: boolean;
      query: string;
      liveLoaded: number;
      liveTotal?: number;
      pagination: SubstanceCatalogPagination;
    };

const CATALOG_PREVIEW_LIMIT = 100;
const SEARCH_LIMIT = 50;
const SEARCH_DEBOUNCE_MS = 300;

function toSummary({
  slug,
  name,
  aliases,
  primaryClass,
  summary,
  categories,
  riskLevel,
  riskLabel,
  quickFacts,
}: Substance): LocalSubstanceSummary {
  return {
    slug,
    name,
    aliases,
    primaryClass,
    summary,
    categories,
    riskLevel,
    riskLabel,
    quickFacts,
  };
}

const CURATED_SUBSTANCES: LocalSubstanceSummary[] = SUBSTANCES.map(toSummary);
const CURATED_SLUGS = new Set(CURATED_SUBSTANCES.map((item) => item.slug));

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

function mergeSearchResults(
  localData: LocalSubstanceSummary[],
  remoteData: LocalSubstanceSummary[],
  query: string,
): LocalSubstanceSummary[] {
  const trimmed = query.trim();
  const relevantRemote = trimmed ? remoteData.filter((item) => matchesSummary(item, trimmed)) : remoteData;
  const bySlug = new Map<string, LocalSubstanceSummary>();

  localData.forEach((item) => bySlug.set(item.slug, item));
  relevantRemote.forEach((item) => {
    if (!bySlug.has(item.slug)) bySlug.set(item.slug, item);
  });

  return Array.from(bySlug.values());
}

function getLiveCatalog(remoteData: LocalSubstanceSummary[]): LocalSubstanceSummary[] {
  return remoteData.filter((item) => !CURATED_SLUGS.has(item.slug));
}

function hasPagination(meta: ApiSubstanceListMeta): boolean {
  return (
    typeof meta.page === 'number' ||
    typeof meta.offset === 'number' ||
    typeof meta.nextPage === 'number' ||
    typeof meta.nextOffset === 'number' ||
    typeof meta.hasMore === 'boolean'
  );
}

function paginationFromMeta(meta: ApiSubstanceListMeta): SubstanceCatalogPagination {
  const available = hasPagination(meta);
  const inferredHasMore =
    typeof meta.nextPage === 'number' ||
    typeof meta.nextOffset === 'number' ||
    (
      typeof meta.total === 'number' &&
      typeof meta.limit === 'number' &&
      meta.total > meta.limit
    );
  const hasMore = available && (meta.hasMore ?? inferredHasMore);

  return { available, hasMore };
}

function useDebouncedValue(value: string): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [value]);

  return debounced;
}

export function useSubstances(query: string): SubstancesState {
  const debouncedQuery = useDebouncedValue(query);
  const localData = useMemo(
    () =>
      SUBSTANCES.filter((substance) => matchesSubstance(substance, debouncedQuery)).map(toSummary),
    [debouncedQuery],
  );
  const isSearching = debouncedQuery.trim().length > 0;
  const [state, setState] = useState<SubstancesState>({
    status: 'success',
    data: CURATED_SUBSTANCES,
    curated: CURATED_SUBSTANCES,
    liveCatalog: [],
    searchResults: [],
    source: 'local',
    refreshing: true,
    query: '',
    liveLoaded: 0,
    pagination: { available: false, hasMore: false },
  });

  useEffect(() => {
    let active = true;
    const queryText = debouncedQuery.trim();
    const requestLimit = isSearching ? SEARCH_LIMIT : CATALOG_PREVIEW_LIMIT;

    setState({
      status: 'success',
      data: isSearching ? localData : CURATED_SUBSTANCES,
      curated: CURATED_SUBSTANCES,
      liveCatalog: [],
      searchResults: isSearching ? localData : [],
      source: 'local',
      refreshing: true,
      query: queryText,
      liveLoaded: 0,
      pagination: { available: false, hasMore: false },
    });

    // TODO: Replace the preview fetch with real page/offset pagination once
    // /api/mobile/substances exposes a cursor, page, or offset contract.
    fetchMobileSubstanceList({
      query: queryText,
      limit: requestLimit,
    })
      .then((result) => {
        if (!active) return;
        const remoteData = result.items;
        const pagination = paginationFromMeta(result.meta);

        if (isSearching) {
          const searchResults = mergeSearchResults(localData, remoteData, queryText);
          if (searchResults.length === 0 && localData.length > 0) {
            setState({
              status: 'success',
              data: localData,
              curated: CURATED_SUBSTANCES,
              liveCatalog: [],
              searchResults: localData,
              source: 'offline',
              refreshing: false,
              query: queryText,
              liveLoaded: 0,
              liveTotal: result.meta.total,
              pagination,
            });
            return;
          }

          setState({
            status: 'success',
            data: searchResults,
            curated: CURATED_SUBSTANCES,
            liveCatalog: [],
            searchResults,
            source: remoteData.length > 0 && localData.length > 0 ? 'mixed' : remoteData.length > 0 ? 'live' : 'local',
            refreshing: false,
            query: queryText,
            liveLoaded: remoteData.length,
            liveTotal: result.meta.total,
            pagination,
          });
          return;
        }

        const liveCatalog = getLiveCatalog(remoteData);
        setState({
          status: 'success',
          data: [...CURATED_SUBSTANCES, ...liveCatalog],
          curated: CURATED_SUBSTANCES,
          liveCatalog,
          searchResults: [],
          source: remoteData.length > 0 ? 'mixed' : 'local',
          refreshing: false,
          query: queryText,
          liveLoaded: remoteData.length,
          liveTotal: result.meta.total,
          pagination,
        });
      })
      .catch(() => {
        if (!active) return;
        setState({
          status: 'success',
          data: isSearching ? localData : CURATED_SUBSTANCES,
          curated: CURATED_SUBSTANCES,
          liveCatalog: [],
          searchResults: isSearching ? localData : [],
          source: 'offline',
          refreshing: false,
          query: queryText,
          liveLoaded: 0,
          pagination: { available: false, hasMore: false },
        });
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery, isSearching, localData]);

  return state;
}
