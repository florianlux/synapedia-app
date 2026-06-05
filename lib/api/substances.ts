import type { RiskLevel, Substance } from '@/types/substance';
import { getJson, SynapediaApiError } from './client';

export type MobileSubstanceItem = {
  id?: unknown;
  slug?: unknown;
  name?: unknown;
  aliases?: unknown;
  class?: unknown;
  class_primary?: unknown;
  classPrimary?: unknown;
  primaryClass?: unknown;
  summary?: unknown;
  tags?: unknown;
  categories?: unknown;
  risk_level?: unknown;
  riskLevel?: unknown;
  risk_label?: unknown;
  riskLabel?: unknown;
  receptor_targets?: unknown;
  receptors?: unknown;
  effects?: unknown;
  effectsSummary?: unknown;
  effects_summary?: unknown;
  duration?: unknown;
  durationSummary?: unknown;
  duration_summary?: unknown;
  risks?: unknown;
  saferUse?: unknown;
  safer_use?: unknown;
  warnings?: unknown;
  mechanisms?: unknown;
  interactions?: unknown;
  interactionsPreview?: unknown;
  interactions_preview?: unknown;
  quickFacts?: unknown;
  onset?: unknown;
  peak?: unknown;
  afterEffects?: unknown;
  lastUpdated?: unknown;
  sources?: unknown;
  evidence?: unknown;
  evidenceNote?: unknown;
  evidence_note?: unknown;
};

type MobileListResponse = {
  items?: unknown;
  source?: unknown;
  meta?: unknown;
};

type MobileDetailResponse = {
  item?: unknown;
  source?: unknown;
  meta?: unknown;
};

type NormalizedDetail = {
  item: Substance;
  mergedWithLocal: boolean;
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

export type ApiSubstanceDetailResult = {
  item: Substance;
  source?: string;
  meta: { dosageExcluded: true; mergedWithLocal: boolean };
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function stringValue(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    const normalized = value.trim();
    const lower = normalized.toLowerCase();
    if (lower === 'null' || lower === 'undefined' || lower === '[object object]') return undefined;
    return normalized;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}

function stringArray(value: unknown, options: { content?: boolean } = {}): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const direct = stringValue(item);
      if (direct) return direct;
      const record = asRecord(item);
      return firstString(record?.title, record?.name, record?.label, record?.text, record?.summary, record?.description);
    })
    .map((item) => (options.content ? normalizeContentText(item) : item))
    .filter((item): item is string => typeof item === 'string' && item.length > 0)
    .filter((item, index, array) => array.indexOf(item) === index);
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    const normalized = stringValue(value);
    if (normalized) return normalized;
  }
  return undefined;
}

function normalizeDuration(value: unknown): string {
  const direct = stringValue(value);
  if (direct) return direct;

  const record = asRecord(value);
  if (record) {
    const parts = Object.entries(record)
      .map(([key, part]) => {
        const normalized = stringValue(part);
        return normalized ? `${key}: ${normalized}` : null;
      })
      .filter((part): part is string => part !== null);
    if (parts.length) return parts.join(' | ');
  }

  return '-';
}

const RAW_CONTENT_TOKENS = new Set([
  'strong',
  'possible',
  'low',
  'moderate',
  'high',
  'unknown',
  'reviewed',
  'class_based',
  'none_known',
]);

const SHORT_CONTENT_ALLOWLIST = new Set<string>();

function isTimestamp(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(?:[tT ][\d:.+-]+Z?)?$/.test(value.trim());
}

function isSingleWordArtifact(value: string): boolean {
  const normalized = value.trim();
  if (SHORT_CONTENT_ALLOWLIST.has(normalized.toLowerCase())) return false;
  if (/^[A-Z0-9-]{2,18}$/.test(normalized)) return true;
  return /^[\p{L}\d-]{2,18}$/u.test(normalized) && !/[,:;.()]/.test(normalized);
}

function isSourceLikeFragment(value: string): boolean {
  return /\bet al\./i.test(value) || /\b(?:journal|pharmacol|addiction|toxicol|psychiatry)\b/i.test(value);
}

function normalizeContentText(value: string | undefined): string | undefined {
  const trimmed = value?.replace(/\s+/g, ' ').trim();
  if (!trimmed) return undefined;

  const lower = trimmed.toLowerCase();
  if (RAW_CONTENT_TOKENS.has(lower)) return undefined;
  if (isTimestamp(trimmed)) return undefined;
  if (isSourceLikeFragment(trimmed)) return undefined;
  if (isSingleWordArtifact(trimmed)) return undefined;
  if (trimmed.length < 24 && !SHORT_CONTENT_ALLOWLIST.has(lower)) return undefined;

  return trimmed;
}

function formatDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

function quickFactValue(item: MobileSubstanceItem, key: string): string | undefined {
  const quickFacts = asRecord(item.quickFacts);
  if (quickFacts) {
    const value = stringValue(quickFacts[key]);
    if (value) return value;
  }
  return undefined;
}

function normalizeRiskLevel(raw: unknown, risks: string[] = []): RiskLevel {
  const lower = stringValue(raw)?.toLowerCase();
  if (lower === 'low' || lower === 'moderate' || lower === 'high' || lower === 'extreme' || lower === 'unknown') {
    return lower;
  }
  if (lower === 'critical' || lower === 'severe' || lower === 'very_high' || lower === 'very-high') return 'extreme';
  if (lower === 'medium' || lower === 'elevated' || lower === 'caution') return 'moderate';
  if (lower === 'minimal' || lower === 'negligible' || lower === 'safe' || lower === 'low-risk') return 'low';

  const haystack = risks.join(' ').toLowerCase();
  if (!haystack) return 'unknown';
  if (haystack.includes('fatal') || haystack.includes('lebens') || haystack.includes('extrem')) return 'extreme';
  if (haystack.includes('hoch') || haystack.includes('high') || haystack.includes('severe')) return 'high';
  if (haystack.includes('moderat') || haystack.includes('mittel') || haystack.includes('moderate')) return 'moderate';
  if (haystack.includes('low') || haystack.includes('gering')) return 'low';
  return 'moderate';
}

function hasUsefulValue(value: string | undefined): boolean {
  return !!value && value !== '-';
}

function pickRemoteOrLocal(remote: string, local?: string): string {
  return hasUsefulValue(remote) ? remote : local ?? remote;
}

function mergeUnique(remote: string[], local: string[] = []): string[] {
  return [...remote, ...local].filter(
    (value, index, array) => value.trim() && array.indexOf(value) === index,
  );
}

function riskLabel(level: RiskLevel, raw?: unknown): string {
  const fromApi = stringValue(raw);
  if (fromApi) return fromApi;

  const labels: Record<RiskLevel, string> = {
    low: 'Geringes Risiko',
    moderate: 'Moderates Risiko',
    high: 'Hohes Risiko',
    extreme: 'Extremes Risiko',
    unknown: 'Unbekanntes Risiko',
  };
  return labels[level];
}

function makeSummary(item: MobileSubstanceItem, primaryClass: string, effects: string[], risks: string[]): string {
  const summary = normalizeContentText(stringValue(item.summary));
  if (summary) return summary;

  const effectText = effects.slice(0, 2).join(', ');
  const riskText = risks.slice(0, 1).join(', ');

  if (effectText && riskText) {
    return `${primaryClass}: ${effectText}. Risiken: ${riskText}.`;
  }
  if (effectText) return `${primaryClass}: ${effectText}.`;
  if (riskText) return `${primaryClass}. Risiko-Kontext: ${riskText}.`;
  return `${primaryClass} aus dem Synapedia Mobile Datensatz.`;
}

export function normalizeMobileSubstanceSummary(item: MobileSubstanceItem): ApiSubstanceListSummary | null {
  const slug = stringValue(item.slug);
  const name = stringValue(item.name);
  if (!slug || !name) return null;

  const effects = stringArray(item.effects ?? item.effectsSummary ?? item.effects_summary, { content: true });
  const risks = stringArray(item.risks, { content: true });
  const mechanisms = stringArray(item.mechanisms);
  const receptors = stringArray(item.receptor_targets).concat(stringArray(item.receptors));
  const tags = stringArray(item.tags);
  const apiCategories = stringArray(item.categories);
  const primaryClass = firstString(item.primaryClass, item.classPrimary, item.class_primary, item.class) ?? 'Substanz';
  const riskLevel = normalizeRiskLevel(firstString(item.riskLevel, item.risk_level), risks);
  const duration = normalizeDuration(firstString(
    quickFactValue(item, 'duration'),
    item.durationSummary,
    item.duration_summary,
    item.duration,
  ));

  return {
    slug,
    name,
    aliases: stringArray(item.aliases),
    primaryClass,
    summary: makeSummary(item, primaryClass, effects, risks),
    categories: [primaryClass, ...apiCategories, ...tags, ...mechanisms.slice(0, 1), ...receptors.slice(0, 1)]
      .filter((value, index, array) => value && array.indexOf(value) === index),
    riskLevel,
    riskLabel: riskLabel(riskLevel, firstString(item.riskLabel, item.risk_label)),
    quickFacts: {
      onset: firstString(quickFactValue(item, 'onset'), item.onset) ?? '-',
      peak: firstString(quickFactValue(item, 'peak'), item.peak) ?? '-',
      duration,
      afterEffects: firstString(quickFactValue(item, 'afterEffects'), item.afterEffects) ?? '-',
    },
  };
}

function normalizeMobileListResponse(response: MobileListResponse): ApiSubstanceListSummary[] {
  if (!Array.isArray(response.items)) {
    throw new SynapediaApiError('Ungueltige Substanzliste.', 200, 'INVALID_RESPONSE');
  }

  return response.items
    .map((item) => normalizeMobileSubstanceSummary(item as MobileSubstanceItem))
    .filter((item): item is ApiSubstanceListSummary => item !== null);
}

function normalizeSource(value: unknown): string | undefined {
  return stringValue(value);
}

function normalizeSourceList(value: unknown): Substance['sources'] {
  if (!Array.isArray(value)) return [];

  return value
    .map((source) => {
      const record = asRecord(source);
      if (!record) return null;
      const title = stringValue(record.title) ?? stringValue(record.label);
      if (!title) return null;
      const yearValue = typeof record.year === 'number' ? record.year : Number(stringValue(record.year));
      const normalized: Substance['sources'][number] = {
        author: stringValue(record.author) ?? 'Synapedia',
        year: Number.isFinite(yearValue) ? yearValue : new Date().getFullYear(),
        title,
      };
      const doi = stringValue(record.doi) ?? stringValue(record.url);
      if (doi) normalized.doi = doi;
      return normalized;
    })
    .filter((source): source is Substance['sources'][number] => source !== null);
}

function normalizeEffects(value: unknown, enrichment?: Substance): Substance['effects'] {
  const record = asRecord(value);
  if (record) {
    const remote = {
      positive: stringArray(record.positive, { content: true }),
      neutral: stringArray(record.neutral, { content: true }),
      negative: stringArray(record.negative, { content: true }),
    };
    return {
      positive: remote.positive.length ? remote.positive : enrichment?.effects.positive ?? [],
      neutral: remote.neutral.length ? remote.neutral : enrichment?.effects.neutral ?? [],
      negative: remote.negative.length ? remote.negative : enrichment?.effects.negative ?? [],
    };
  }

  const effects = stringArray(value, { content: true });
  if (effects.length) {
    return {
      positive: effects,
      neutral: enrichment?.effects.neutral ?? [],
      negative: enrichment?.effects.negative ?? [],
    };
  }

  return enrichment?.effects ?? { positive: [], neutral: [], negative: [] };
}

function normalizeRiskEntry(value: unknown, fallbackSeverity: RiskLevel): Substance['risks']['acute'][number] | null {
  const direct = normalizeContentText(stringValue(value));
  if (direct) {
    const name = direct.includes(':')
      ? direct.split(':')[0]
      : direct.length > 82
        ? `${direct.slice(0, 79).trim()}...`
        : direct;
    return { name, severity: fallbackSeverity, description: direct };
  }

  const record = asRecord(value);
  if (!record) return null;

  const name = normalizeContentText(firstString(record.name, record.title, record.label, record.risk, record.summary));
  const description = normalizeContentText(firstString(record.description, record.text, record.summary, record.detail)) ?? name;
  if (!name || !description) return null;

  return {
    name,
    severity: normalizeRiskLevel(record.severity ?? record.riskLevel ?? record.risk_level, [name]) === 'unknown'
      ? fallbackSeverity
      : normalizeRiskLevel(record.severity ?? record.riskLevel ?? record.risk_level, [name]),
    description,
  };
}

function normalizeRiskGroup(value: unknown, fallbackSeverity: RiskLevel): Substance['risks']['acute'] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => normalizeRiskEntry(item, fallbackSeverity))
    .filter((risk): risk is Substance['risks']['acute'][number] => risk !== null);
}

function normalizeRisks(value: unknown, riskLevel: RiskLevel, enrichment?: Substance): Substance['risks'] {
  const fallbackSeverity = riskLevel === 'unknown' ? 'moderate' : riskLevel;
  const record = asRecord(value);
  if (record) {
    const acute = normalizeRiskGroup(record.acute ?? record.immediate ?? record.items, fallbackSeverity);
    const longterm = normalizeRiskGroup(record.longterm ?? record.longTerm ?? record.chronic, fallbackSeverity);
    return {
      acute: acute.length ? acute : enrichment?.risks.acute ?? [],
      longterm: longterm.length ? longterm : enrichment?.risks.longterm ?? [],
    };
  }

  const acute = normalizeRiskGroup(value, fallbackSeverity);
  if (acute.length) {
    return {
      acute,
      longterm: enrichment?.risks.longterm ?? [],
    };
  }

  return enrichment?.risks ?? { acute: [], longterm: [] };
}

function normalizeSaferUse(value: unknown, enrichment?: Substance): Substance['saferUse'] {
  if (!Array.isArray(value)) return enrichment?.saferUse ?? [];

  const tips = value
    .map((item) => {
      const direct = normalizeContentText(stringValue(item));
      if (direct) {
        return {
          title: direct.includes(':') ? direct.split(':')[0] : direct,
          description: direct,
        };
      }

      const record = asRecord(item);
      if (!record) return null;
      const title = normalizeContentText(firstString(record.title, record.name, record.label, record.summary));
      const description = normalizeContentText(firstString(record.description, record.text, record.detail, record.summary)) ?? title;
      if (!title || !description) return null;
      return { title, description };
    })
    .filter((tip): tip is Substance['saferUse'][number] => tip !== null);

  return tips.length ? tips : enrichment?.saferUse ?? [];
}

function normalizeInteractionSeverity(raw: unknown): Substance['interactions'][number]['severity'] {
  const value = stringValue(raw)?.toLowerCase();
  if (value === 'lethal' || value === 'dangerous' || value === 'risky' || value === 'caution' || value === 'low-risk') {
    return value;
  }
  if (value === 'high' || value === 'critical') return 'dangerous';
  if (value === 'moderate' || value === 'medium') return 'risky';
  if (value === 'low') return 'low-risk';
  return 'caution';
}

function normalizeInteractions(value: unknown, enrichment?: Substance): Substance['interactions'] {
  if (!Array.isArray(value)) return enrichment?.interactionsPreview ?? enrichment?.interactions ?? [];

  const interactions = value
    .map((item) => {
      const record = asRecord(item);
      if (!record) {
        const substance = normalizeContentText(stringValue(item));
        return substance ? { substance, severity: 'caution' as const, description: 'Interaktion lokal noch nicht detailliert.' } : null;
      }

      const pair = Array.isArray(record.pair) ? record.pair : undefined;
      const substance = firstString(record.substance, record.name, record.title, record.label, pair?.[1]);
      const description = normalizeContentText(firstString(record.description, record.summary, record.text, record.risk)) ?? substance;
      if (!substance || !description) return null;

      return {
        substance,
        severity: normalizeInteractionSeverity(record.severity ?? record.riskLevel ?? record.risk_level),
        description,
      };
    })
    .filter((interaction): interaction is Substance['interactions'][number] => interaction !== null);

  return interactions.length ? interactions : enrichment?.interactionsPreview ?? enrichment?.interactions ?? [];
}

function normalizeQuickFacts(
  summary: ApiSubstanceListSummary,
  enrichment?: Substance,
): Substance['quickFacts'] {
  return {
    onset: pickRemoteOrLocal(summary.quickFacts.onset, enrichment?.quickFacts.onset),
    peak: pickRemoteOrLocal(summary.quickFacts.peak, enrichment?.quickFacts.peak),
    duration: pickRemoteOrLocal(summary.quickFacts.duration, enrichment?.quickFacts.duration),
    afterEffects: pickRemoteOrLocal(summary.quickFacts.afterEffects, enrichment?.quickFacts.afterEffects),
  };
}

function normalizeDurationDetail(value: unknown, quickFacts: Substance['quickFacts'], enrichment?: Substance): Substance['duration'] {
  const record = asRecord(value);
  if (record) {
    const phases = Array.isArray(record.phases)
      ? record.phases
          .map((phase) => {
            const phaseRecord = asRecord(phase);
            if (!phaseRecord) return null;
            const label = firstString(phaseRecord.label, phaseRecord.title, phaseRecord.name);
            const phaseValue = firstString(phaseRecord.value, phaseRecord.duration, phaseRecord.description);
            return label && phaseValue ? { label, value: phaseValue } : null;
          })
          .filter((phase): phase is Substance['duration']['phases'][number] => phase !== null)
      : [];
    const total = firstString(record.total, record.duration, record.summary);
    if (phases.length || total) {
      return {
        phases: phases.length ? phases : enrichment?.duration.phases ?? [],
        total: total ?? enrichment?.duration.total ?? quickFacts.duration,
      };
    }
  }

  if (enrichment?.duration.phases.length) return enrichment.duration;

  return {
    phases: [
      { label: 'Eintritt', value: quickFacts.onset },
      { label: 'Peak', value: quickFacts.peak },
      { label: 'Dauer', value: quickFacts.duration },
      { label: 'Nachklang', value: quickFacts.afterEffects },
    ].filter((phase) => hasUsefulValue(phase.value)),
    total: quickFacts.duration,
  };
}

function normalizeDetailItem(item: MobileSubstanceItem, enrichment?: Substance): NormalizedDetail | null {
  const summary = normalizeMobileSubstanceSummary(item);
  if (!summary) return null;

  const remoteClass = firstString(item.primaryClass, item.classPrimary, item.class_primary, item.class);
  const remoteSummary = normalizeContentText(stringValue(item.summary));
  const remoteRiskLevel = firstString(item.riskLevel, item.risk_level);
  const hasUsefulRemoteRisk = !!remoteRiskLevel && summary.riskLevel !== 'unknown';
  const riskLevel = hasUsefulRemoteRisk ? summary.riskLevel : enrichment?.riskLevel ?? summary.riskLevel;
  const primaryClass = remoteClass ?? enrichment?.primaryClass ?? summary.primaryClass ?? 'Substanz';
  const remoteCategories = [
    primaryClass,
    ...stringArray(item.categories),
    ...stringArray(item.tags),
    ...stringArray(item.receptor_targets).slice(0, 1),
    ...stringArray(item.receptors).slice(0, 1),
  ].filter((value, index, array): value is string => !!value && array.indexOf(value) === index);
  const quickFacts = normalizeQuickFacts(summary, enrichment);
  const effects = normalizeEffects(item.effects, enrichment);
  const risks = normalizeRisks(item.risks, riskLevel, enrichment);
  const saferUse = normalizeSaferUse(item.saferUse ?? item.safer_use, enrichment);
  const remoteWarnings = stringArray(item.warnings, { content: true });
  const remoteMechanisms = stringArray(item.mechanisms, { content: true });
  const warnings = mergeUnique(remoteWarnings, enrichment?.warnings);
  const mechanisms = mergeUnique(remoteMechanisms, enrichment?.mechanisms);
  const remoteInteractions = item.interactionsPreview ?? item.interactions_preview ?? item.interactions;
  const interactions = normalizeInteractions(item.interactionsPreview ?? item.interactions_preview ?? item.interactions, enrichment);
  const sources = normalizeSourceList(item.sources);
  const evidence = asRecord(item.evidence);

  const mergedWithLocal = !!enrichment && (
    !remoteClass ||
    !remoteSummary ||
    !hasUsefulRemoteRisk ||
    stringArray(item.effects, { content: true }).length === 0 && !asRecord(item.effects) ||
    stringArray(item.risks, { content: true }).length === 0 && !asRecord(item.risks) ||
    stringArray(item.saferUse ?? item.safer_use, { content: true }).length === 0 ||
    remoteWarnings.length === 0 ||
    remoteMechanisms.length === 0 ||
    !Array.isArray(remoteInteractions) ||
    sources.length === 0
  );

  const normalized: Substance = {
    slug: summary.slug,
    name: summary.name,
    aliases: enrichment?.aliases?.length ? enrichment.aliases : summary.aliases ?? [],
    chemicalName: enrichment?.chemicalName ?? '',
    primaryClass,
    summary: remoteSummary ?? enrichment?.summary ?? summary.summary,
    categories: remoteCategories.length > 1 || remoteClass ? remoteCategories : enrichment?.categories ?? summary.categories,
    riskLevel,
    riskLabel: hasUsefulRemoteRisk ? summary.riskLabel : enrichment?.riskLabel ?? summary.riskLabel,
    riskChips: remoteCategories.length > 1 || remoteClass ? remoteCategories.slice(0, 3) : enrichment?.riskChips ?? summary.categories.slice(0, 3),
    quickFacts,
    dosage: { routes: [] },
    duration: normalizeDurationDetail(item.duration, quickFacts, enrichment),
    effects,
    risks,
    saferUse,
    warnings,
    mechanisms,
    interactions,
    interactionsPreview: interactions,
    sources: sources.length ? sources : enrichment?.sources ?? [],
    evidenceNote:
      firstString(item.evidenceNote, item.evidence_note, evidence?.note, evidence?.summary) ??
      enrichment?.evidenceNote,
    lastUpdated:
      formatDate(stringValue(item.lastUpdated) ?? stringValue(evidence?.lastReviewedAt)) ??
      enrichment?.lastUpdated ??
      '',
  };

  return {
    item: normalized,
    mergedWithLocal,
  };
}

export async function fetchMobileSubstances(query: string): Promise<ApiSubstanceListSummary[]> {
  const trimmed = query.trim();
  const response = await getJson<MobileListResponse>(
    '/api/mobile/substances',
    trimmed ? { q: trimmed, limit: 20 } : { limit: 20 },
  );

  return normalizeMobileListResponse(response);
}

export async function fetchMobileSubstanceDetail(
  slug: string,
  enrichment?: Substance,
): Promise<ApiSubstanceDetailResult> {
  const response = await getJson<MobileDetailResponse>(`/api/mobile/substances/${encodeURIComponent(slug)}`);
  const result = normalizeDetailItem(response.item as MobileSubstanceItem, enrichment);

  if (!result) {
    throw new SynapediaApiError('Ungueltiges Substanzdetail.', 200, 'INVALID_RESPONSE');
  }

  return {
    item: result.item,
    source: normalizeSource(response.source),
    meta: { dosageExcluded: true, mergedWithLocal: result.mergedWithLocal },
  };
}
