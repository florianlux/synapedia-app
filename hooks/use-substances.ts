import { useCallback, useEffect, useMemo, useState } from 'react';

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
  page: number;
  totalPages?: number;
  limit: number;
};

type SubstancesSuccessData = {
  data: LocalSubstanceSummary[];
  curated: LocalSubstanceSummary[];
  liveCatalog: LocalSubstanceSummary[];
  searchResults: LocalSubstanceSummary[];
  source: SubstanceSource;
  refreshing: boolean;
  loadingMore: boolean;
  query: string;
  liveLoaded: number;
  liveTotal?: number;
  pagination: SubstanceCatalogPagination;
  loadedLiveSlugs: string[];
  errorMessage?: string;
};

export type SubstancesState =
  | { status: 'loading' }
  | (SubstancesSuccessData & {
      status: 'success';
      loadMoreLiveCatalog: () => void;
    });

const CATALOG_PAGE_LIMIT = 20;
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

function mergeLoadedLiveSlugs(existing: string[], remoteData: LocalSubstanceSummary[]): string[] {
  const bySlug = new Map(existing.map((slug) => [slug, slug]));
  remoteData.forEach((item) => {
    if (!bySlug.has(item.slug)) bySlug.set(item.slug, item.slug);
  });
  return Array.from(bySlug.values());
}

function stableItemKey(item: LocalSubstanceSummary): string {
  return item.slug.trim().toLowerCase() || item.name.trim().toLowerCase();
}

function mergeLiveCatalog(
  existing: LocalSubstanceSummary[],
  remoteData: LocalSubstanceSummary[],
): LocalSubstanceSummary[] {
  const bySlug = new Map(existing.map((item) => [stableItemKey(item), item]));
  remoteData.forEach((item) => {
    const key = stableItemKey(item);
    if (!CURATED_SLUGS.has(item.slug) && !bySlug.has(key)) {
      bySlug.set(key, item);
    }
  });
  return Array.from(bySlug.values());
}

function paginationFromMeta(
  meta: ApiSubstanceListMeta,
  fallbackPage: number,
): SubstanceCatalogPagination {
  const page = meta.page ?? fallbackPage;
  const totalPages = meta.totalPages;
  const hasMore =
    meta.hasMore ??
    (
      typeof totalPages === 'number'
        ? page < totalPages
        : typeof meta.total === 'number' && typeof meta.limit === 'number'
          ? page * meta.limit < meta.total
          : false
    );

  return {
    available: true,
    hasMore,
    page,
    totalPages,
    limit: meta.limit ?? CATALOG_PAGE_LIMIT,
  };
}

function loadedCountFromPagination(
  loadedSlugs: string[],
  pagination: SubstanceCatalogPagination,
  total?: number,
): number {
  if (typeof total === 'number' && pagination.limit > 0) {
    return Math.min(total, Math.max(loadedSlugs.length, pagination.page * pagination.limit));
  }
  return loadedSlugs.length;
}

function createBaseState(query: string): SubstancesSuccessData {
  return {
    data: CURATED_SUBSTANCES,
    curated: CURATED_SUBSTANCES,
    liveCatalog: [],
    searchResults: [],
    source: 'local',
    refreshing: true,
    loadingMore: false,
    query,
    liveLoaded: 0,
    pagination: {
      available: true,
      hasMore: false,
      page: 0,
      limit: CATALOG_PAGE_LIMIT,
    },
    loadedLiveSlugs: [],
  };
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
  const [state, setState] = useState<SubstancesSuccessData>(() => createBaseState(''));

  useEffect(() => {
    let active = true;
    const queryText = debouncedQuery.trim();

    setState((current) => ({
      ...current,
      data: isSearching ? localData : [...CURATED_SUBSTANCES, ...current.liveCatalog],
      curated: CURATED_SUBSTANCES,
      searchResults: isSearching ? localData : [],
      query: queryText,
      refreshing: true,
      loadingMore: false,
      errorMessage: undefined,
    }));

    fetchMobileSubstanceList({
      query: queryText,
      limit: isSearching ? SEARCH_LIMIT : CATALOG_PAGE_LIMIT,
      page: isSearching ? undefined : 1,
    })
      .then((result) => {
        if (!active) return;
        const remoteData = result.items;

        if (isSearching) {
          const searchResults = mergeSearchResults(localData, remoteData, queryText);
          setState({
            ...createBaseState(queryText),
            data: searchResults,
            searchResults,
            source: remoteData.length > 0 && localData.length > 0 ? 'mixed' : remoteData.length > 0 ? 'live' : 'local',
            refreshing: false,
            liveLoaded: remoteData.length,
            liveTotal: result.meta.total,
            pagination: paginationFromMeta(result.meta, 1),
            loadedLiveSlugs: remoteData.map((item) => item.slug),
          });
          return;
        }

        const loadedLiveSlugs = mergeLoadedLiveSlugs([], remoteData);
        const liveCatalog = mergeLiveCatalog([], remoteData);
        const pagination = paginationFromMeta(result.meta, 1);
        setState({
          ...createBaseState(queryText),
          data: [...CURATED_SUBSTANCES, ...liveCatalog],
          liveCatalog,
          source: remoteData.length > 0 ? 'mixed' : 'local',
          refreshing: false,
          liveLoaded: loadedCountFromPagination(loadedLiveSlugs, pagination, result.meta.total),
          liveTotal: result.meta.total,
          pagination,
          loadedLiveSlugs,
        });
      })
      .catch(() => {
        if (!active) return;
        setState((current) => ({
          ...current,
          data: isSearching ? localData : [...CURATED_SUBSTANCES, ...current.liveCatalog],
          curated: CURATED_SUBSTANCES,
          searchResults: isSearching ? localData : [],
          source: current.liveCatalog.length > 0 && !isSearching ? current.source : 'offline',
          refreshing: false,
          loadingMore: false,
          query: queryText,
          errorMessage: isSearching
            ? 'Live-Suche gerade nicht erreichbar. Lokale Treffer bleiben sichtbar.'
            : 'Live-Katalog gerade nicht erreichbar. Bereits geladene Daten bleiben sichtbar.',
        }));
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery, isSearching, localData]);

  const loadMoreLiveCatalog = useCallback(() => {
    if (isSearching || state.refreshing || state.loadingMore || !state.pagination.hasMore) return;

    const nextPage = state.pagination.page + 1;
    setState((current) => ({ ...current, loadingMore: true }));

    fetchMobileSubstanceList({
      limit: CATALOG_PAGE_LIMIT,
      page: nextPage,
    })
      .then((result) => {
        setState((current) => {
          const loadedLiveSlugs = mergeLoadedLiveSlugs(current.loadedLiveSlugs, result.items);
          const liveCatalog = mergeLiveCatalog(current.liveCatalog, result.items);
          const pagination = paginationFromMeta(result.meta, nextPage);
          const page = Math.max(current.pagination.page, nextPage, pagination.page);
          const nextPagination = {
            ...pagination,
            page,
            hasMore: pagination.hasMore && (
              typeof pagination.totalPages === 'number' ? page < pagination.totalPages : true
            ),
          };

          return {
            ...current,
            data: [...CURATED_SUBSTANCES, ...liveCatalog],
            liveCatalog,
            source: result.items.length > 0 ? 'mixed' : current.source,
            refreshing: false,
            loadingMore: false,
            errorMessage: undefined,
            liveLoaded: loadedCountFromPagination(
              loadedLiveSlugs,
              nextPagination,
              result.meta.total ?? current.liveTotal,
            ),
            liveTotal: result.meta.total ?? current.liveTotal,
            pagination: nextPagination,
            loadedLiveSlugs,
          };
        });
      })
      .catch(() => {
        setState((current) => ({
          ...current,
          loadingMore: false,
          source: current.liveCatalog.length > 0 ? current.source : 'offline',
          errorMessage: 'Weitere Live-Daten konnten gerade nicht geladen werden.',
        }));
      });
  }, [isSearching, state.loadingMore, state.pagination.hasMore, state.pagination.page, state.refreshing]);

  return {
    status: 'success',
    ...state,
    loadMoreLiveCatalog,
  };
}
