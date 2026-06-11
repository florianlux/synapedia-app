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
  if (typeof value === 'string' && value.trim()) {
    const normalized = value.trim();
    const lower = normalized.toLowerCase();
    if (lower === 'null' || lower === 'undefined' || lower === '[object object]') {
      return undefined;
    }
    return normalized;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}

function stringFromRichValue(value: unknown): string | undefined {
  const plain = stringValue(value);
  if (plain) return plain;

  const record = asRecord(value);
  if (!record) return undefined;

  return firstString(
    record.text,
    record.description,
    record.summary,
    record.title,
    record.label,
    record.name,
    record.note,
    record.message,
    record.value,
  );
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    const item = stringFromRichValue(value);
    if (item) return item;
  }
  return undefined;
}

function collectStrings(...values: unknown[]): string[] {
  const items: string[] = [];

  function visit(value: unknown) {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    const item = stringFromRichValue(value);
    if (item && !items.includes(item)) items.push(item);
  }

  values.forEach(visit);
  return items;
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
  if (
    value.includes('unknown') ||
    value.includes('unbekannt') ||
    value.includes('insufficient') ||
    value.includes('not_found') ||
    value.includes('no_data') ||
    value.includes('no known')
  ) {
    return 'unknown';
  }
  if (
    value.includes('lethal') ||
    value.includes('critical') ||
    value.includes('dangerous') ||
    value.includes('contraindicated') ||
    value.includes('avoid')
  ) return 'critical';
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

function substanceIdentifier(value: unknown): string | undefined {
  const record = asRecord(value);
  if (record) {
    return firstString(record.slug, record.id, record.key, record.code, record.name, record.label);
  }
  return stringValue(value);
}

function normalizeTitle(nameA: string, nameB: string): string {
  return `${nameA} + ${nameB}`;
}

function unknownSummary(): string {
  return 'Für diese Kombination liegen keine belastbaren Interaktionsdaten vor. Fehlende Daten bedeuten nicht, dass die Kombination sicher ist.';
}

function normalizePair(pair: Record<string, unknown>, slugA: string, slugB: string): InteractionDetail | null {
  const pairSlugs = firstArray(pair.pair, pair.substance_pair, pair.substancePair);
  const substances = firstArray(pair.substances, pair.substance_slugs, pair.substanceSlugs, pair.slugs);
  const names = firstArray(pair.names);
  const substanceA = firstString(
    pair.substance_a_slug,
    pair.substanceASlug,
    pair.substance_a,
    pair.substanceA,
    pair.drug_a,
    pair.drugA,
    pair.a,
    substanceIdentifier(pairSlugs?.[0]),
    substanceIdentifier(substances?.[0]),
  ) ?? slugA;
  const substanceB = firstString(
    pair.substance_b_slug,
    pair.substanceBSlug,
    pair.substance_b,
    pair.substanceB,
    pair.drug_b,
    pair.drugB,
    pair.b,
    substanceIdentifier(pairSlugs?.[1]),
    substanceIdentifier(substances?.[1]),
  ) ?? slugB;
  const substanceARecord = firstRecord(pair.substance_a, pair.substanceA, pair.drug_a, pair.drugA, pair.a);
  const substanceBRecord = firstRecord(pair.substance_b, pair.substanceB, pair.drug_b, pair.drugB, pair.b);
  const nameA = firstString(
    pair.substance_a_name,
    pair.substanceAName,
    pair.name_a,
    pair.nameA,
    substanceARecord?.name,
    substanceARecord?.label,
    names?.[0],
    substanceA,
  ) ?? slugA;
  const nameB = firstString(
    pair.substance_b_name,
    pair.substanceBName,
    pair.name_b,
    pair.nameB,
    substanceBRecord?.name,
    substanceBRecord?.label,
    names?.[1],
    substanceB,
  ) ?? slugB;
  const pharmacology = asRecord(pair.pharmacology);
  const confidence = asRecord(pair.confidence);
  const sources = asRecord(pair.sources);
  const references = firstArray(sources?.references);
  const harmReduction = collectStrings(
    pharmacology?.harm_reduction,
    pharmacology?.harmReduction,
    pair.harm_reduction,
    pair.harmReduction,
    pair.safer_use,
    pair.saferUse,
    pair.saferUseNotes,
    pair.recommendations,
    pair.advice,
  );
  const warnings = collectStrings(
    pair.warnings,
    pair.red_flags,
    pair.redFlags,
    pair.danger_signs,
    pair.dangerSigns,
    pair.contraindications,
  );
  const riskFactors = collectStrings(pair.risk_factors, pair.riskFactors, pair.risks);
  const mechanisms = collectStrings(
    pharmacology?.mechanisms,
    pharmacology?.mechanism,
    pair.mechanisms,
    pair.mechanism,
    pair.pharmacodynamic_mechanisms,
    pair.pharmacokinetic_mechanisms,
  );
  const riskLevel = normalizeRiskLevel(pair.severity, pair.risk_classification ?? pair.riskClassification ?? pair.classification ?? pair.risk_level);
  const summary = firstString(
    pair.summary,
    pair.explanation,
    pair.description,
    pair.assessment,
    pair.result_summary,
    pair.resultSummary,
    pair.recommendation,
  ) ?? (riskLevel === 'unknown' ? unknownSummary() : undefined);

  if (!summary) return null;

  return {
    id: makeInteractionId(substanceA, substanceB),
    substanceA,
    substanceB,
    title: firstString(pair.title) ?? normalizeTitle(nameA, nameB),
    riskLevel,
    severity: normalizeSeverity(pair.severity),
    summary,
    mechanisms,
    riskFactors: [...riskFactors, ...warnings, ...harmReduction].filter((item, index, list) => list.indexOf(item) === index),
    saferUseNotes: harmReduction,
    redFlags: warnings.length
      ? warnings
      : riskLevel === 'unknown'
        ? []
        : ['Bei schweren oder ungewoehnlichen Symptomen medizinische Hilfe holen.'],
    evidence: normalizeEvidence(confidence?.evidence_basis ?? confidence?.level ?? pair.evidence ?? pair.evidence_level),
    evidenceNote: references?.length
      ? `${stringValue(sources?.count) ?? references.length} Quellen verfügbar.`
      : firstString(pair.evidence_note, pair.evidenceNote, confidence?.note)
        ?? 'Live-Daten aus Synapedia Mobile.',
    sourceNote: firstString(pair.source_note, pair.sourceNote, sources?.summary, sources?.label)
      ?? 'Live-Daten. Fehlende oder begrenzte Evidenz bedeutet nicht sicher.',
  };
}

function extractInteraction(response: InteractionResponse, slugA: string, slugB: string): InteractionDetail | null {
  const data = firstRecord(response.data, response.item, response.result, response.interaction, response);
  if (!data) {
    throw new SynapediaApiError('Ungültige Interaktionsantwort.', 200, 'INVALID_RESPONSE');
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
