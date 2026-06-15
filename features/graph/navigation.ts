import type { GraphNode, GraphNodeType } from './types';

const WEB_GRAPH_BASE_URL = 'https://synapedia.com/graph';

type ShortFocusPrefix = 's' | 'r' | 'e' | 'm' | 'q';

const SHORT_TO_API_PREFIX: Record<Exclude<ShortFocusPrefix, 'q'>, string> = {
  s: 'substance',
  r: 'receptor',
  e: 'effect',
  m: 'mechanism',
};

const API_TO_SHORT_PREFIX: Record<string, ShortFocusPrefix> = {
  substance: 's',
  receptor: 'r',
  effect: 'e',
  mechanism: 'm',
  query: 'q',
};

const NODE_TO_SHORT_PREFIX: Partial<Record<GraphNodeType, ShortFocusPrefix>> = {
  substance: 's',
  receptor: 'r',
  effect: 'e',
  mechanism: 'm',
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function sanitizeGraphSlug(value: string | undefined): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function sanitizeGraphQuery(value: string | undefined): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[<>#?&=/%\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 80);
}

export function normalizeGraphFocus(value: string | string[] | undefined): string | undefined {
  const raw = firstParam(value)?.trim();
  if (!raw) return undefined;

  const separatorIndex = raw.indexOf(':');
  const rawPrefix = separatorIndex >= 0 ? raw.slice(0, separatorIndex).trim().toLowerCase() : 's';
  const rawValue = separatorIndex >= 0 ? raw.slice(separatorIndex + 1) : raw;
  const prefix = (API_TO_SHORT_PREFIX[rawPrefix] ?? rawPrefix) as ShortFocusPrefix;

  if (prefix === 'q') {
    const query = sanitizeGraphQuery(rawValue);
    return query ? `q:${query}` : undefined;
  }

  if (prefix !== 's' && prefix !== 'r' && prefix !== 'e' && prefix !== 'm') {
    return undefined;
  }

  const slug = sanitizeGraphSlug(rawValue);
  return slug ? `${prefix}:${slug}` : undefined;
}

export function graphFocusToApiFocus(value: string | string[] | undefined): string | undefined {
  const focus = normalizeGraphFocus(value);
  if (!focus) return undefined;

  const [prefix, rawSlug] = focus.split(':');
  if (!rawSlug) return undefined;
  if (prefix === 'q') return `query:${rawSlug}`;

  const apiPrefix = SHORT_TO_API_PREFIX[prefix as Exclude<ShortFocusPrefix, 'q'>];
  return apiPrefix ? `${apiPrefix}:${rawSlug}` : undefined;
}

export function graphFocusValue(value: string | string[] | undefined): string | undefined {
  return normalizeGraphFocus(value)?.split(':').slice(1).join(':');
}

export function graphFocusType(value: string | string[] | undefined): GraphNodeType | undefined {
  const focus = normalizeGraphFocus(value);
  if (!focus) return undefined;

  const prefix = focus.split(':')[0] as ShortFocusPrefix;
  if (prefix === 's') return 'substance';
  if (prefix === 'r') return 'receptor';
  if (prefix === 'e') return 'effect';
  if (prefix === 'm') return 'mechanism';
  return 'article';
}

export function graphFocusLabel(value: string | string[] | undefined): string {
  const slug = graphFocusValue(value);
  if (!slug) return 'Graph';
  return slug
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase('de-DE') + part.slice(1))
    .join(' ');
}

export function makeSubstanceFocus(slug: string): string | undefined {
  const normalized = sanitizeGraphSlug(slug);
  return normalized ? `s:${normalized}` : undefined;
}

export function buildSubstanceWebGraphUrl(slug: string): string | undefined {
  const normalized = sanitizeGraphSlug(slug);
  if (!normalized) return undefined;
  return `${WEB_GRAPH_BASE_URL}?focus=substance:${normalized}`;
}

export function buildGraphFocusPath(
  focus: string,
  options: { safetyMode?: boolean } = {},
): { pathname: '/graph/focus'; params: { focus: string; safetyMode?: string } } | undefined {
  const normalized = normalizeGraphFocus(focus);
  if (!normalized) return undefined;

  return {
    pathname: '/graph/focus',
    params: {
      focus: normalized,
      ...(options.safetyMode ? { safetyMode: '1' } : {}),
    },
  };
}

export function focusFromGraphNode(node: GraphNode): string | undefined {
  const prefix = NODE_TO_SHORT_PREFIX[node.type];
  const slug = sanitizeGraphSlug(node.slug ?? node.id.split(':').pop());
  return prefix && slug ? `${prefix}:${slug}` : undefined;
}

export function buildWebGraphUrlForNode(node: GraphNode): string | undefined {
  if (node.type === 'substance' && node.slug) {
    return buildSubstanceWebGraphUrl(node.slug);
  }

  const focus = focusFromGraphNode(node);
  const apiFocus = graphFocusToApiFocus(focus);
  return apiFocus ? `${WEB_GRAPH_BASE_URL}?focus=${apiFocus}` : undefined;
}
