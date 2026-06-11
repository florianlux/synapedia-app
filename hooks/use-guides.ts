import { useEffect, useState } from 'react';

import { GUIDES, GUIDES_MAP, type Guide } from '@/constants/guides';
import { fetchMobileGuideDetail, fetchMobileGuides, type GuideSource } from '@/lib/api/guides';

export type GuidesState =
  | { status: 'success'; data: Guide[]; source: GuideSource; refreshing: boolean }
  | { status: 'loading' };

export type GuideState =
  | { status: 'loading' }
  | { status: 'success'; data: Guide; source: GuideSource; refreshing: boolean }
  | { status: 'error'; message: string; notFound?: boolean };

export function useGuides(): GuidesState {
  const [state, setState] = useState<GuidesState>({
    status: 'success',
    data: GUIDES,
    source: 'local',
    refreshing: true,
  });

  useEffect(() => {
    let active = true;

    setState({ status: 'success', data: GUIDES, source: 'local', refreshing: true });

    fetchMobileGuides()
      .then((guides) => {
        if (!active) return;
        if (guides.length === 0) {
          setState({ status: 'success', data: GUIDES, source: 'offline', refreshing: false });
          return;
        }
        setState({ status: 'success', data: guides, source: 'live', refreshing: false });
      })
      .catch(() => {
        if (!active) return;
        setState({ status: 'success', data: GUIDES, source: 'offline', refreshing: false });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}

export function useGuide(slug: string | undefined): GuideState {
  const localGuide = slug ? GUIDES_MAP[slug] : undefined;
  const [state, setState] = useState<GuideState>(() => {
    if (!slug) {
      return { status: 'error', message: 'Ungültige Guide-ID.', notFound: true };
    }
    if (localGuide) {
      return { status: 'success', data: localGuide, source: 'local', refreshing: true };
    }
    return { status: 'loading' };
  });

  useEffect(() => {
    let active = true;

    if (!slug) {
      setState({ status: 'error', message: 'Ungültige Guide-ID.', notFound: true });
      return () => {
        active = false;
      };
    }

    if (localGuide) {
      setState({ status: 'success', data: localGuide, source: 'local', refreshing: true });
    } else {
      setState({ status: 'loading' });
    }

    fetchMobileGuideDetail(slug, localGuide)
      .then((result) => {
        if (!active) return;
        setState({
          status: 'success',
          data: result.guide,
          source: result.mergedWithLocal ? 'mixed' : 'live',
          refreshing: false,
        });
      })
      .catch(() => {
        if (!active) return;
        if (localGuide) {
          setState({ status: 'success', data: localGuide, source: 'offline', refreshing: false });
          return;
        }
        setState({ status: 'error', message: 'Guide nicht gefunden.', notFound: true });
      });

    return () => {
      active = false;
    };
  }, [slug, localGuide]);

  return state;
}
