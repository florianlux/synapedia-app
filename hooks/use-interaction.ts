import { useEffect, useState } from 'react';

import { findInteraction } from '@/constants/interactions';
import { fetchMobileInteractionCheck } from '@/lib/api/interactions';
import type { EvidenceLevel, InteractionDetail, MixCheckRiskLevel } from '@/types/interaction';

export type InteractionSource = 'live' | 'mixed' | 'local' | 'offline';

export type InteractionState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: InteractionDetail; source: InteractionSource; refreshing: boolean }
  | { status: 'not_found'; source?: InteractionSource; refreshing?: boolean }
  | { status: 'error'; message: string };

export function useInteraction(
  slugA: string | null,
  slugB: string | null,
): InteractionState {
  const [state, setState] = useState<InteractionState>({ status: 'idle' });

  useEffect(() => {
    let active = true;

    if (!slugA || !slugB) {
      setState({ status: 'idle' });
      return () => {
        active = false;
      };
    }

    const local = findInteraction(slugA, slugB);
    if (local) {
      setState({ status: 'success', data: local, source: 'local', refreshing: true });
    } else {
      setState({ status: 'loading' });
    }

    fetchMobileInteractionCheck(slugA, slugB)
      .then((remote) => {
        if (!active) return;
        if (!remote) {
          setState({ status: 'not_found', source: 'live', refreshing: false });
          return;
        }

        const merged = mergeInteractionDetail(remote, local);
        setState({
          status: 'success',
          data: merged.data,
          source: merged.usedLocal ? 'mixed' : 'live',
          refreshing: false,
        });
      })
      .catch(() => {
        if (!active) return;
        if (local) {
          setState({ status: 'success', data: local, source: 'offline', refreshing: false });
          return;
        }
        setState({ status: 'not_found', source: 'offline', refreshing: false });
      });

    return () => {
      active = false;
    };
  }, [slugA, slugB]);

  return state;
}

const riskRank: Record<MixCheckRiskLevel, number> = {
  unknown: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const evidenceRank: Record<EvidenceLevel, number> = {
  anecdotal: 0,
  limited: 1,
  moderate: 2,
  strong: 3,
};

function mergeInteractionDetail(
  remote: InteractionDetail,
  local: InteractionDetail | null,
): { data: InteractionDetail; usedLocal: boolean } {
  if (!local) return { data: remote, usedLocal: false };

  let usedLocal = false;

  function chooseText(remoteText: string, localText: string): string {
    if (!localText) return remoteText;
    if (!remoteText || remoteText.length < Math.min(localText.length * 0.65, 90)) {
      usedLocal = true;
      return localText;
    }
    return remoteText;
  }

  function mergeList(remoteItems: string[], localItems: string[]): string[] {
    if (!localItems.length) return remoteItems;
    if (!remoteItems.length) {
      usedLocal = true;
      return localItems;
    }

    const merged = [...remoteItems];
    localItems.forEach((item) => {
      if (!merged.includes(item)) merged.push(item);
    });

    if (merged.length > remoteItems.length) usedLocal = true;
    return merged;
  }

  const riskLevel =
    riskRank[remote.riskLevel] >= riskRank[local.riskLevel]
      ? remote.riskLevel
      : local.riskLevel;
  if (riskLevel === local.riskLevel && riskLevel !== remote.riskLevel) usedLocal = true;

  const evidence =
    evidenceRank[remote.evidence] >= evidenceRank[local.evidence]
      ? remote.evidence
      : local.evidence;
  if (evidence === local.evidence && evidence !== remote.evidence) usedLocal = true;

  return {
    data: {
      ...remote,
      title: chooseText(remote.title, local.title),
      riskLevel,
      severity: riskLevel === local.riskLevel && riskLevel !== remote.riskLevel ? local.severity : remote.severity,
      summary: chooseText(remote.summary, local.summary),
      mechanisms: mergeList(remote.mechanisms, local.mechanisms),
      riskFactors: mergeList(remote.riskFactors, local.riskFactors),
      saferUseNotes: mergeList(remote.saferUseNotes, local.saferUseNotes),
      redFlags: mergeList(remote.redFlags, local.redFlags),
      evidence,
      evidenceNote: chooseText(remote.evidenceNote, local.evidenceNote),
      sourceNote: chooseText(remote.sourceNote, local.sourceNote),
    },
    usedLocal,
  };
}
