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

export type GuideSource = 'live' | 'local' | 'offline';

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

function normalizeSections(value: unknown): GuideSection[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((section) => {
      const record = asRecord(section);
      if (!record) return null;
      const title = stringValue(record.title);
      const items = stringArray(record.items);
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
      const description = stringValue(record.description) ?? stringValue(record.summary);
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
    summary: stringValue(item.summary) ?? fallback?.summary ?? '',
    category: stringValue(item.category) ?? fallback?.category ?? 'Guide',
    accent: stringValue(item.accent) ?? fallback?.accent ?? '#0A84FF',
    safetyDisclaimer:
      stringValue(item.safetyDisclaimer) ??
      stringValue(item.safety_disclaimer) ??
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
      stringValue(item.evidenceNote) ??
      stringValue(item.evidence_note) ??
      fallback?.evidenceNote ??
      'Live-Daten aus Synapedia Mobile.',
  };
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

export async function fetchMobileGuideDetail(slug: string, fallback?: Guide): Promise<Guide> {
  const response = await getJson<GuideResponse>(`/api/mobile/guides/${encodeURIComponent(slug)}`);
  const guide = normalizeGuide(response.item as GuideItem, fallback);
  if (!guide) {
    throw new SynapediaApiError('Ungueltiges Guidedetail.', 200, 'INVALID_RESPONSE');
  }
  return guide;
}
