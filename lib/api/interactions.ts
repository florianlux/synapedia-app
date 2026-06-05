import type { InteractionSeverity } from '@/types/substance';
import type { EvidenceLevel, InteractionDetail, MixCheckRiskLevel } from '@/types/interaction';
import { getJson, SynapediaApiError } from './client';

type InteractionResponse = {
  data?: unknown;
  item?: unknown;
  result?: unknown;
  interaction?: unknown;
  interactions?: unknown;
  source?: unknown;
  meta?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function stringValue(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(stringValue)
    .filter((item): item is string => typeof item === 'string' && item.length > 0);
}

function firstRecord(...values: unknown[]): Record<string, unknown> | null {
  for (const value of values) {
    const record = asRecord(value);
    if (record) return record;
  }
  return null;
}

function firstArray(...values: unknown[]): unknown[] | null {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }
  return null;
}

function normalizeSeverity(raw: unknown): InteractionSeverity {
  const lower = stringValue(raw)?.toLowerCase();
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
  return lower ? map[lower] ?? 'caution' : 'caution';
}

function normalizeRiskLevel(severity: unknown, classification: unknown): MixCheckRiskLevel {
  const value = `${stringValue(classification) ?? ''} ${stringValue(severity) ?? ''}`.toLowerCase();
  if (value.includes('lethal') || value.includes('critical') || value.includes('dangerous')) return 'critical';
  if (value.includes('high') || value.includes('risky')) return 'high';
  if (value.includes('moderate') || value.includes('caution')) return 'medium';
  if (value.includes('low')) return 'low';
  return 'unknown';
}

function normalizeEvidence(raw: unknown): EvidenceLevel {
  const lower = stringValue(raw)?.toLowerCase();
  if (lower === 'high' || lower === 'curated' || lower === 'strong') return 'strong';
  if (lower === 'medium' || lower === 'class_based' || lower === 'moderate') return 'moderate';
  if (lower === 'low' || lower === 'limited') return 'limited';
  return 'anecdotal';
}

function makeInteractionId(a: string, b: string): string {
  return [a, b].sort().join('+');
}

function normalizePair(pair: Record<string, unknown>, slugA: string, slugB: string): InteractionDetail | null {
  const pairSlugs = firstArray(pair.pair);
  const names = firstArray(pair.names);
  const substanceA = stringValue(pairSlugs?.[0]) ?? slugA;
  const substanceB = stringValue(pairSlugs?.[1]) ?? slugB;
  const nameA = stringValue(names?.[0]) ?? substanceA;
  const nameB = stringValue(names?.[1]) ?? substanceB;
  const pharmacology = asRecord(pair.pharmacology);
  const confidence = asRecord(pair.confidence);
  const sources = asRecord(pair.sources);
  const references = firstArray(sources?.references);
  const harmReduction = stringArray(pharmacology?.harm_reduction);
  const warnings = stringArray(pair.warnings);
  const mechanisms = stringArray(pharmacology?.mechanisms);
  const summary = stringValue(pair.summary);

  if (!summary) return null;

  return {
    id: makeInteractionId(substanceA, substanceB),
    substanceA,
    substanceB,
    title: `${nameA} + ${nameB}`,
    riskLevel: normalizeRiskLevel(pair.severity, pair.risk_classification),
    severity: normalizeSeverity(pair.severity),
    summary,
    mechanisms,
    riskFactors: [...warnings, ...harmReduction].filter(Boolean),
    saferUseNotes: harmReduction,
    redFlags: warnings.length
      ? warnings
      : ['Bei schweren oder ungewoehnlichen Symptomen medizinische Hilfe holen.'],
    evidence: normalizeEvidence(confidence?.evidence_basis ?? confidence?.level),
    evidenceNote: references?.length
      ? `${stringValue(sources?.count) ?? references.length} Quellen verfuegbar.`
      : 'Live-Daten aus Synapedia Mobile.',
    sourceNote: 'Live-Daten. Fehlende oder begrenzte Evidenz bedeutet nicht sicher.',
  };
}

function extractInteraction(response: InteractionResponse, slugA: string, slugB: string): InteractionDetail | null {
  const data = firstRecord(response.data, response.item, response.result, response.interaction, response);
  if (!data) {
    throw new SynapediaApiError('Ungueltige Interaktionsantwort.', 200, 'INVALID_RESPONSE');
  }

  const interactions = firstArray(data.interactions, response.interactions);
  if (interactions) {
    const normalized = interactions
      .map((item) => {
        const record = asRecord(item);
        return record ? normalizePair(record, slugA, slugB) : null;
      })
      .find((item): item is InteractionDetail => item !== null);
    return normalized ?? null;
  }

  const pair = firstRecord(data.pair, data.interaction, data);
  if (!pair) return null;
  return normalizePair(pair, slugA, slugB);
}

export async function fetchMobileInteractionCheck(
  slugA: string,
  slugB: string,
): Promise<InteractionDetail | null> {
  const response = await getJson<InteractionResponse>(
    '/api/mobile/interactions/check',
    { a: slugA, b: slugB, locale: 'de' },
  );

  return extractInteraction(response, slugA, slugB);
}
