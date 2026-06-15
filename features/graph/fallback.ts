import { SUBSTANCES_MAP } from '@/constants/mock-data';
import type { RiskLevel, Substance } from '@/types/substance';

import {
  graphFocusLabel,
  graphFocusType,
  graphFocusValue,
  normalizeGraphFocus,
  sanitizeGraphSlug,
} from './navigation';
import type { GraphEdge, GraphNode, GraphPayload, GraphRiskLevel } from './types';

export const POPULAR_GRAPH_SUBSTANCES = [
  { label: 'LSD', slug: 'lsd' },
  { label: 'MDMA', slug: 'mdma' },
  { label: 'Ketamin', slug: 'ketamin' },
  { label: 'Cannabis', slug: 'cannabis' },
  { label: 'Psilocybin', slug: 'psilocybin' },
  { label: 'Kokain', slug: 'kokain' },
  { label: 'Amphetamin', slug: 'amphetamin' },
  { label: 'DMT', slug: 'dmt' },
] as const;

const POPULAR_LABEL_BY_SLUG = new Map<string, string>(
  POPULAR_GRAPH_SUBSTANCES.map((item) => [item.slug, item.label]),
);

function riskLevelFromSubstance(level: RiskLevel | undefined): GraphRiskLevel {
  if (level === 'extreme') return 'critical';
  if (level === 'low' || level === 'moderate' || level === 'high') return level;
  return 'unknown';
}

function riskLevelFromInteraction(severity: Substance['interactions'][number]['severity']): GraphRiskLevel {
  if (severity === 'lethal' || severity === 'dangerous') return 'critical';
  if (severity === 'risky') return 'high';
  if (severity === 'low-risk') return 'low';
  return 'moderate';
}

function compactLabel(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= 52) return normalized;
  return `${normalized.slice(0, 49).trim()}...`;
}

function makeNeutralFallback(focus: string, safetyMode: boolean): GraphPayload {
  const type = graphFocusType(focus) ?? 'article';
  const value = graphFocusValue(focus) ?? 'graph';
  const label = graphFocusLabel(focus);
  const centralType = type === 'article' ? 'article' : type;
  const centralId = `${centralType}:${value}`;

  return {
    focus,
    nodes: [
      {
        id: centralId,
        type: centralType,
        label,
        ...(centralType === 'substance' ? { slug: value } : {}),
        riskLevel: 'unknown',
      },
      {
        id: `article:${value}-fallback`,
        type: 'article',
        label: 'Lokaler Informationsausschnitt',
        riskLevel: 'unknown',
      },
    ],
    edges: [
      {
        id: `mentioned_in:${centralId}__article:${value}-fallback`,
        source: centralId,
        target: `article:${value}-fallback`,
        type: 'mentioned_in',
        label: 'lokaler Kontext',
        riskLevel: 'unknown',
      },
    ],
    meta: {
      source: 'fallback',
      generatedAt: new Date().toISOString(),
      safetyMode,
    },
  };
}

export function createFallbackGraphPayload(
  rawFocus: string | undefined,
  safetyMode = false,
): GraphPayload {
  const focus = normalizeGraphFocus(rawFocus) ?? 's:mdma';
  const slug = graphFocusValue(focus);
  const type = graphFocusType(focus);

  if (type !== 'substance' || !slug) {
    return makeNeutralFallback(focus, safetyMode);
  }

  const normalizedSlug = sanitizeGraphSlug(slug);
  const substance = SUBSTANCES_MAP[normalizedSlug];
  const label = substance?.name ?? POPULAR_LABEL_BY_SLUG.get(normalizedSlug) ?? graphFocusLabel(focus);
  const centralId = `substance:${normalizedSlug}`;
  const nodes: GraphNode[] = [
    {
      id: centralId,
      type: 'substance',
      label,
      slug: normalizedSlug,
      riskLevel: riskLevelFromSubstance(substance?.riskLevel),
      ...(substance?.primaryClass ? { classPrimary: substance.primaryClass } : {}),
    },
  ];
  const edges: GraphEdge[] = [];

  substance?.mechanisms.slice(0, 3).forEach((mechanism, index) => {
    const mechanismId = `mechanism:${normalizedSlug}-${index + 1}`;
    nodes.push({
      id: mechanismId,
      type: 'mechanism',
      label: compactLabel(mechanism),
      riskLevel: 'unknown',
    });
    edges.push({
      id: `mechanism:${centralId}__${mechanismId}`,
      source: centralId,
      target: mechanismId,
      type: 'mechanism',
      label: 'vorhandener Mechanismus',
      riskLevel: 'unknown',
    });
  });

  substance?.interactions.slice(0, 4).forEach((interaction) => {
    const targetSlug = sanitizeGraphSlug(interaction.substance);
    const interactionId = `interaction:${normalizedSlug}-${targetSlug || interaction.substance.toLowerCase()}`;
    const riskLevel = riskLevelFromInteraction(interaction.severity);
    nodes.push({
      id: interactionId,
      type: 'interaction',
      label: compactLabel(interaction.substance),
      riskLevel,
    });
    edges.push({
      id: `interaction:${centralId}__${interactionId}`,
      source: centralId,
      target: interactionId,
      type: 'interaction',
      label: 'vorhandene Interaktion',
      riskLevel,
    });
  });

  if (nodes.length === 1) {
    nodes.push({
      id: `article:${normalizedSlug}-fallback`,
      type: 'article',
      label: 'Lokaler Informationsausschnitt',
      riskLevel: 'unknown',
    });
    edges.push({
      id: `mentioned_in:${centralId}__article:${normalizedSlug}-fallback`,
      source: centralId,
      target: `article:${normalizedSlug}-fallback`,
      type: 'mentioned_in',
      label: 'lokaler Kontext',
      riskLevel: 'unknown',
    });
  }

  return {
    focus,
    nodes,
    edges,
    meta: {
      source: 'fallback',
      generatedAt: new Date().toISOString(),
      safetyMode,
    },
  };
}
