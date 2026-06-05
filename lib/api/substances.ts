import type { RiskLevel } from '@/types/substance';
import { getJson, SynapediaApiError } from './client';

export type LabsSubstanceItem = {
  id?: unknown;
  slug?: unknown;
  name?: unknown;
  class_primary?: unknown;
  mechanisms?: unknown;
  receptor_targets?: unknown;
  effects?: unknown;
  duration?: unknown;
  risks?: unknown;
};

type LabsSubstancesResponse = {
  items?: unknown;
};

export type ApiSubstanceListSummary = {
  slug: string;
  name: string;
  aliases?: string[];
  primaryClass?: string;
  summary?: string;
  categories: string[];
  riskLevel: RiskLevel;
  riskLabel: string;
  quickFacts: {
    onset: string;
    peak: string;
    duration: string;
    afterEffects: string;
  };
};

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function normalizeDuration(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value && typeof value === 'object') {
    const parts = Object.entries(value)
      .filter(([, part]) => typeof part === 'string' || typeof part === 'number')
      .map(([key, part]) => `${key}: ${part}`);
    if (parts.length) return parts.join(' | ');
  }
  return '—';
}

function normalizeRiskLevel(risks: string[]): RiskLevel {
  const haystack = risks.join(' ').toLowerCase();
  if (!haystack) return 'unknown';
  if (haystack.includes('fatal') || haystack.includes('lebens') || haystack.includes('extrem')) return 'extreme';
  if (haystack.includes('hoch') || haystack.includes('high') || haystack.includes('severe')) return 'high';
  if (haystack.includes('moderat') || haystack.includes('mittel') || haystack.includes('moderate')) return 'moderate';
  if (haystack.includes('low') || haystack.includes('gering')) return 'low';
  return 'moderate';
}

function riskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    low: 'Geringes Risiko',
    moderate: 'Moderates Risiko',
    high: 'Hohes Risiko',
    extreme: 'Extremes Risiko',
    unknown: 'Unbekanntes Risiko',
  };
  return labels[level];
}

function makeSummary(item: LabsSubstanceItem, effects: string[], risks: string[]): string {
  const className = typeof item.class_primary === 'string' ? item.class_primary : 'Substanz';
  const effectText = effects.slice(0, 2).join(', ');
  const riskText = risks.slice(0, 1).join(', ');

  if (effectText && riskText) {
    return `${className}: ${effectText}. Risiken: ${riskText}.`;
  }
  if (effectText) return `${className}: ${effectText}.`;
  if (riskText) return `${className}. Risiko-Kontext: ${riskText}.`;
  return `${className} aus dem Synapedia Labs Datensatz.`;
}

export function normalizeLabsSubstance(item: LabsSubstanceItem): ApiSubstanceListSummary | null {
  if (typeof item.slug !== 'string' || !item.slug.trim()) return null;
  if (typeof item.name !== 'string' || !item.name.trim()) return null;

  const effects = stringArray(item.effects);
  const risks = stringArray(item.risks);
  const mechanisms = stringArray(item.mechanisms);
  const receptors = stringArray(item.receptor_targets);
  const primaryClass = typeof item.class_primary === 'string' && item.class_primary.trim()
    ? item.class_primary.trim()
    : 'Substanz';
  const riskLevel = normalizeRiskLevel(risks);
  const duration = normalizeDuration(item.duration);

  return {
    slug: item.slug.trim(),
    name: item.name.trim(),
    aliases: [],
    primaryClass,
    summary: makeSummary(item, effects, risks),
    categories: [primaryClass, ...mechanisms.slice(0, 1), ...receptors.slice(0, 1)].filter(Boolean),
    riskLevel,
    riskLabel: riskLabel(riskLevel),
    quickFacts: {
      onset: '—',
      peak: '—',
      duration,
      afterEffects: '—',
    },
  };
}

function normalizeLabsResponse(response: LabsSubstancesResponse): ApiSubstanceListSummary[] {
  if (!Array.isArray(response.items)) {
    throw new SynapediaApiError('Ungueltige Substanzliste.', 200, 'INVALID_RESPONSE');
  }

  return response.items
    .map((item) => normalizeLabsSubstance(item as LabsSubstanceItem))
    .filter((item): item is ApiSubstanceListSummary => item !== null);
}

export async function fetchLabsSubstances(query: string): Promise<ApiSubstanceListSummary[]> {
  const trimmed = query.trim();
  const response = await getJson<LabsSubstancesResponse>(
    '/api/labs/substances',
    trimmed
      ? { q: trimmed, limit: 20 }
      : { featured: true, limit: 20 },
  );

  return normalizeLabsResponse(response);
}
