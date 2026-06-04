import type { Substance, RiskLevel, InteractionSeverity } from '@/types/substance';
import type { InteractionDetail, EvidenceLevel } from '@/types/interaction';
import type {
  ApiSubstanceSummary,
  ApiSubstanceDetail,
  ApiInteractionCheckData,
  ApiInteractionPair,
} from './types';

// ── Helpers ─────────────────────────────────────────────────────────────────

const VALID_RISK_LEVELS: RiskLevel[] = ['low', 'moderate', 'high', 'extreme', 'unknown'];

function normalizeRiskLevel(raw: string | null | undefined): RiskLevel {
  if (!raw) return 'unknown';
  const lower = raw.toLowerCase().trim();
  if (VALID_RISK_LEVELS.includes(lower as RiskLevel)) return lower as RiskLevel;
  if (lower === 'critical' || lower === 'severe' || lower === 'very_high' || lower === 'very-high')
    return 'extreme';
  if (lower === 'medium' || lower === 'elevated' || lower === 'caution') return 'moderate';
  if (lower === 'minimal' || lower === 'negligible' || lower === 'safe' || lower === 'low-risk')
    return 'low';
  return 'unknown';
}

function riskLevelLabel(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low: 'Geringes Risiko',
    moderate: 'Moderates Risiko',
    high: 'Hohes Risiko',
    extreme: 'Extremes Risiko',
    unknown: 'Unbekannt',
  };
  return map[level];
}

function normalizeCategories(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return [raw.trim()];
}

function normalizeSeverity(raw: string | null | undefined): InteractionSeverity {
  if (!raw) return 'caution';
  const lower = raw.toLowerCase().trim();
  // API severity values → mobile InteractionSeverity
  const map: Record<string, InteractionSeverity> = {
    high: 'dangerous',
    dangerous: 'dangerous',
    lethal: 'lethal',
    moderate: 'risky',
    risky: 'risky',
    low: 'low-risk',
    'low-risk': 'low-risk',
    caution: 'caution',
    unknown: 'caution',
  };
  return map[lower] ?? 'caution';
}

function normalizeEvidenceLevel(raw: string | null | undefined): EvidenceLevel {
  if (!raw) return 'limited';
  const lower = raw.toLowerCase().trim();
  if (lower === 'high' || lower === 'curated' || lower === 'strong') return 'strong';
  if (lower === 'medium' || lower === 'class_based' || lower === 'moderate') return 'moderate';
  if (lower === 'low' || lower === 'limited') return 'limited';
  return 'anecdotal';
}

// ── Substance summary (for search results + picker) ──────────────────────────

export interface NormalizedSubstanceSummary {
  slug: string;
  name: string;
  categories: string[];
}

export function normalizeSubstanceSummary(
  raw: ApiSubstanceSummary,
): NormalizedSubstanceSummary {
  return {
    slug: raw.slug ?? '',
    name: raw.name ?? raw.slug ?? 'Unbekannt',
    categories: normalizeCategories(raw.class),
  };
}

export function normalizeSubstanceSummaries(
  raw: ApiSubstanceSummary[] | null | undefined,
): NormalizedSubstanceSummary[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s) => s && s.slug)
    .map(normalizeSubstanceSummary);
}

// ── Full substance detail ─────────────────────────────────────────────────────
// The free tier API returns only basic fields.
// We merge with a local enrichment object (from mock-data) when available.

export function normalizeSubstanceDetail(
  raw: ApiSubstanceDetail,
  enrichment?: Substance,
): Substance {
  const riskLevel = normalizeRiskLevel(raw.risk_level);

  return {
    slug: raw.slug,
    name: raw.name ?? raw.slug ?? 'Unbekannt',
    chemicalName: enrichment?.chemicalName ?? '',
    categories: raw.class
      ? [raw.class]
      : enrichment?.categories ?? [],
    riskLevel,
    riskLabel: enrichment?.riskLabel ?? riskLevelLabel(riskLevel),
    riskChips: enrichment?.riskChips ?? (raw.tags ?? []),
    quickFacts: enrichment?.quickFacts ?? {
      onset: '—',
      peak: '—',
      duration: '—',
      afterEffects: '—',
    },
    dosage: enrichment?.dosage ?? { routes: [] },
    duration: enrichment?.duration ?? { phases: [], total: '—' },
    effects: enrichment?.effects ?? {
      positive: [],
      neutral: [],
      negative: [],
    },
    risks: enrichment?.risks ?? { acute: [], longterm: [] },
    saferUse: enrichment?.saferUse ?? [],
    interactions: enrichment?.interactions ?? [],
    sources: enrichment?.sources ?? [],
    lastUpdated: enrichment?.lastUpdated ?? '',
  };
}

// ── Interaction check ─────────────────────────────────────────────────────────

function makeInteractionId(a: string, b: string): string {
  return [a, b].sort().join('+');
}

export function normalizeInteractionPair(
  pair: ApiInteractionPair,
): InteractionDetail {
  const slugA = pair.pair[0];
  const slugB = pair.pair[1];

  const mechanisms: string[] = pair.pharmacology?.mechanisms ?? [];
  const harmReduction: string[] = pair.pharmacology?.harm_reduction ?? [];

  // Combine warnings + harm_reduction into riskFactors
  const riskFactors: string[] = [
    ...pair.warnings,
    ...harmReduction,
  ].filter(Boolean);

  const evidenceLevel = normalizeEvidenceLevel(pair.confidence?.evidence_basis);

  return {
    id: makeInteractionId(slugA, slugB),
    substanceA: slugA,
    substanceB: slugB,
    title: `${slugA} + ${slugB}`,
    riskLevel: 'unknown',
    severity: normalizeSeverity(pair.severity),
    summary: pair.summary ?? '',
    mechanisms,
    riskFactors,
    saferUseNotes: harmReduction.length
      ? harmReduction
      : ['Keine kuratierten lokalen Safer-Use-Hinweise vorhanden.'],
    redFlags: ['Bei schweren oder ungewoehnlichen Symptomen medizinische Hilfe holen.'],
    evidence: evidenceLevel,
    evidenceNote: pair.sources?.references?.length
      ? `${pair.sources.count} Quellen verfügbar.`
      : 'Basierend auf pharmakologischer Analyse.',
    sourceNote: 'API-basierte Bewertung; lokale Quellenkuratierung ausstehend.',
  };
}

export function normalizeInteractionCheckData(
  data: ApiInteractionCheckData,
): InteractionDetail[] {
  return data.interactions.map(normalizeInteractionPair);
}
