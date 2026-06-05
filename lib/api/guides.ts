import type { Guide, GuidePhase, GuideSection } from '@/constants/guides';
import { getJson, SynapediaApiError } from './client';

type GuideResponse = {
  items?: unknown;
  item?: unknown;
  source?: unknown;
  meta?: unknown;
};

type GuideItem = {
  slug?: unknown;
  title?: unknown;
  summary?: unknown;
  category?: unknown;
  accent?: unknown;
  safetyDisclaimer?: unknown;
  safety_disclaimer?: unknown;
  symptoms?: unknown;
  sections?: unknown;
  phases?: unknown;
  redFlags?: unknown;
  red_flags?: unknown;
  practicalSteps?: unknown;
  practical_steps?: unknown;
  evidenceNote?: unknown;
  evidence_note?: unknown;
};

export type GuideSource = 'live' | 'mixed' | 'local' | 'offline';

export type GuideDetailResult = {
  guide: Guide;
  mergedWithLocal: boolean;
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
    .map((item) => normalizeGuideText(stringValue(item)))
    .filter((item): item is string => typeof item === 'string' && item.length > 0);
}

function isTruncatedText(value: string): boolean {
  const trimmed = value.trim();
  return /(?:…|\.\.\.)$/.test(trimmed);
}

function normalizeGuideText(value: string | undefined): string | undefined {
  const normalized = value
    ?.replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[-*]\s+/, '')
    .replace(/^#{1,6}\s*/, '')
    .trim();

  if (!normalized || normalized === '...' || normalized === '…') return undefined;
  if (isTruncatedText(normalized)) return undefined;
  if (/^\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?$/.test(normalized)) return undefined;
  if (/^\|.*\|$/.test(normalized)) return undefined;

  return normalized;
}

function bodyToItems(value: unknown): string[] {
  const body = stringValue(value);
  if (!body || isTruncatedText(body)) return [];

  const bulletItems = body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => normalizeGuideText(line))
    .filter((line): line is string => !!line);

  if (bulletItems.length > 1) {
    return bulletItems.slice(0, 8);
  }

  const paragraphItems = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => !/^#{1,6}\s*/.test(paragraph))
    .map((paragraph) => normalizeGuideText(paragraph))
    .filter((paragraph): paragraph is string => !!paragraph && paragraph.length > 32);

  if (paragraphItems.length > 0) {
    return paragraphItems
      .flatMap((paragraph) => paragraph.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ0-9])/))
      .map(normalizeGuideText)
      .filter((line): line is string => !!line)
      .slice(0, 8);
  }

  const normalizedBody = normalizeGuideText(body);
  if (!normalizedBody) return [];

  return normalizedBody
    .split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ0-9])/)
    .map(normalizeGuideText)
    .filter((item): item is string => !!item)
    .slice(0, 5);
}

function normalizeSections(value: unknown): GuideSection[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((section) => {
      const record = asRecord(section);
      if (!record) return null;
      const title = stringValue(record.title);
      const items = stringArray(record.items).length ? stringArray(record.items) : bodyToItems(record.body);
      if (!title || items.length === 0) return null;
      return { title, items };
    })
    .filter((section): section is GuideSection => section !== null);
}

function normalizePhases(value: unknown): GuidePhase[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((phase) => {
      const record = asRecord(phase);
      if (!record) return null;
      const label = stringValue(record.label) ?? stringValue(record.title);
      const description = normalizeGuideText(stringValue(record.description) ?? stringValue(record.summary));
      if (!label || !description) return null;
      return { label, description };
    })
    .filter((phase): phase is GuidePhase => phase !== null);
}

function normalizeGuide(item: GuideItem, fallback?: Guide): Guide | null {
  const slug = stringValue(item.slug) ?? fallback?.slug;
  const title = stringValue(item.title) ?? fallback?.title;
  if (!slug || !title) return null;

  const symptoms = normalizeSections(item.symptoms).length
    ? normalizeSections(item.symptoms)
    : normalizeSections(item.sections);

  return {
    slug,
    title,
    summary: normalizeGuideText(stringValue(item.summary)) ?? fallback?.summary ?? '',
    category: stringValue(item.category) ?? fallback?.category ?? 'Guide',
    accent: stringValue(item.accent) ?? fallback?.accent ?? '#0A84FF',
    safetyDisclaimer:
      normalizeGuideText(stringValue(item.safetyDisclaimer)) ??
      normalizeGuideText(stringValue(item.safety_disclaimer)) ??
      fallback?.safetyDisclaimer ??
      '',
    symptoms: symptoms.length ? symptoms : fallback?.symptoms ?? [],
    phases: normalizePhases(item.phases).length ? normalizePhases(item.phases) : fallback?.phases ?? [],
    redFlags: stringArray(item.redFlags).length
      ? stringArray(item.redFlags)
      : stringArray(item.red_flags).length
        ? stringArray(item.red_flags)
        : fallback?.redFlags ?? [],
    practicalSteps: stringArray(item.practicalSteps).length
      ? stringArray(item.practicalSteps)
      : stringArray(item.practical_steps).length
        ? stringArray(item.practical_steps)
        : fallback?.practicalSteps ?? [],
    evidenceNote:
      normalizeGuideText(stringValue(item.evidenceNote)) ??
      normalizeGuideText(stringValue(item.evidence_note)) ??
      fallback?.evidenceNote ??
      'Live-Daten aus Synapedia Mobile.',
  };
}

function guideUsesFallback(guide: Guide, fallback?: Guide): boolean {
  if (!fallback) return false;
  return (
    guide.summary === fallback.summary ||
    guide.safetyDisclaimer === fallback.safetyDisclaimer ||
    guide.symptoms === fallback.symptoms ||
    guide.phases === fallback.phases ||
    guide.redFlags === fallback.redFlags ||
    guide.practicalSteps === fallback.practicalSteps ||
    guide.evidenceNote === fallback.evidenceNote
  );
}

export async function fetchMobileGuides(): Promise<Guide[]> {
  const response = await getJson<GuideResponse>('/api/mobile/guides', { limit: 20 });
  if (!Array.isArray(response.items)) {
    throw new SynapediaApiError('Ungueltige Guideliste.', 200, 'INVALID_RESPONSE');
  }

  return response.items
    .map((item) => normalizeGuide(item as GuideItem))
    .filter((guide): guide is Guide => guide !== null);
}

export async function fetchMobileGuideDetail(slug: string, fallback?: Guide): Promise<GuideDetailResult> {
  const response = await getJson<GuideResponse>(`/api/mobile/guides/${encodeURIComponent(slug)}`);
  const guide = normalizeGuide(response.item as GuideItem, fallback);
  if (!guide) {
    throw new SynapediaApiError('Ungueltiges Guidedetail.', 200, 'INVALID_RESPONSE');
  }
  return {
    guide,
    mergedWithLocal: guideUsesFallback(guide, fallback),
  };
}
