import {
  graphFocusToApiFocus,
  graphFocusType,
  graphFocusValue,
  normalizeGraphFocus,
} from './navigation';
import type {
  GraphEdge,
  GraphEdgeType,
  GraphNode,
  GraphNodeType,
  GraphPayload,
  GraphRiskLevel,
} from './types';

const MAX_PREVIEW_NODES = 40;
const MAX_PREVIEW_EDGES = 60;

const NODE_TYPES: GraphNodeType[] = [
  'substance',
  'receptor',
  'effect',
  'mechanism',
  'interaction',
  'article',
];

const EDGE_TYPES: GraphEdgeType[] = [
  'similar',
  'binds_to',
  'causes_effect',
  'interaction',
  'mechanism',
  'mentioned_in',
];

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as RawRecord;
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);

    const record = asRecord(value);
    if (record) {
      const nested = firstString(record.id, record.slug, record.label, record.name, record.title);
      if (nested) return nested;
    }
  }
  return undefined;
}

function numberValue(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const fromString = Number(firstString(value));
  return Number.isFinite(fromString) ? fromString : undefined;
}

function normalizeNodeType(value: unknown): GraphNodeType | undefined {
  const normalized = firstString(value)?.toLowerCase();
  return NODE_TYPES.includes(normalized as GraphNodeType) ? normalized as GraphNodeType : undefined;
}

function normalizeRiskLevel(value: unknown): GraphRiskLevel | undefined {
  const normalized = firstString(value)?.toLowerCase();
  if (!normalized) return undefined;
  if (normalized === 'low' || normalized === 'moderate' || normalized === 'high' || normalized === 'critical' || normalized === 'unknown') {
    return normalized;
  }
  if (normalized === 'extreme' || normalized === 'lethal' || normalized === 'dangerous' || normalized === 'severe') {
    return 'critical';
  }
  if (normalized === 'medium' || normalized === 'risky' || normalized === 'caution') return 'moderate';
  if (normalized === 'low-risk' || normalized === 'minimal') return 'low';
  return 'unknown';
}

function normalizeEdgeType(value: unknown): GraphEdgeType | undefined {
  const normalized = firstString(value)?.toLowerCase();
  if (!normalized) return undefined;
  if (EDGE_TYPES.includes(normalized as GraphEdgeType)) return normalized as GraphEdgeType;
  if (normalized === 'similar_to') return 'similar';
  if (normalized === 'acts_on') return 'binds_to';
  if (normalized === 'has_effect') return 'causes_effect';
  if (normalized === 'has_mechanism') return 'mechanism';
  if (normalized.startsWith('interaction_')) return 'interaction';
  if (normalized === 'article_about') return 'mentioned_in';
  return undefined;
}

function normalizeNode(value: unknown): GraphNode | null {
  const record = asRecord(value);
  if (!record) return null;

  const meta = asRecord(record.meta);
  const type = normalizeNodeType(record.type ?? record.kind);
  const id = firstString(record.id);
  const label = firstString(record.label, record.name, record.title, meta?.label, meta?.name);
  if (!type || !id || !label) return null;

  const slug = firstString(record.slug, meta?.slug) ?? (id.includes(':') ? id.split(':').pop() : undefined);
  const riskLevel = normalizeRiskLevel(
    record.riskLevel ??
    record.risk_level ??
    record.riskSeverity ??
    meta?.riskLevel ??
    meta?.risk_level ??
    meta?.riskSeverity,
  );
  const classPrimary = firstString(record.classPrimary, record.class_primary, meta?.classPrimary, meta?.category);
  const confidence = numberValue(record.confidence ?? meta?.confidence);

  return {
    id,
    type,
    label,
    ...(slug ? { slug } : {}),
    ...(riskLevel ? { riskLevel } : {}),
    ...(classPrimary ? { classPrimary } : {}),
    ...(typeof confidence === 'number' ? { confidence } : {}),
  };
}

function normalizeEdge(value: unknown): GraphEdge | null {
  const record = asRecord(value);
  if (!record) return null;

  const source = firstString(record.source);
  const target = firstString(record.target);
  const type = normalizeEdgeType(record.type ?? record.kind);
  if (!source || !target || !type) return null;

  const id = firstString(record.id) ?? `${type}:${source}__${target}`;
  const label = firstString(record.label, record.title);
  const riskLevel = normalizeRiskLevel(record.riskLevel ?? record.risk_level ?? record.riskSeverity ?? record.severity);
  const weight = numberValue(record.weight ?? record.visualStrength ?? record.value);

  return {
    id,
    source,
    target,
    type,
    ...(label ? { label } : {}),
    ...(riskLevel ? { riskLevel } : {}),
    ...(typeof weight === 'number' ? { weight } : {}),
  };
}

function dedupeNodes(nodes: GraphNode[]): GraphNode[] {
  const byId = new Map<string, GraphNode>();
  nodes.forEach((node) => {
    if (!byId.has(node.id)) byId.set(node.id, node);
  });
  return Array.from(byId.values());
}

function dedupeEdges(edges: GraphEdge[]): GraphEdge[] {
  const byId = new Map<string, GraphEdge>();
  edges.forEach((edge) => {
    if (!byId.has(edge.id)) byId.set(edge.id, edge);
  });
  return Array.from(byId.values());
}

function findFocusNode(nodes: GraphNode[], focus: string | undefined): GraphNode | undefined {
  const normalizedFocus = normalizeGraphFocus(focus);
  const apiFocus = graphFocusToApiFocus(normalizedFocus);
  const focusValue = graphFocusValue(normalizedFocus);
  const focusType = graphFocusType(normalizedFocus);
  if (!focusValue) return nodes[0];

  return nodes.find((node) => (
    node.id === apiFocus ||
    node.id === normalizedFocus ||
    (node.type === focusType && node.slug === focusValue) ||
    (node.type === focusType && node.id.endsWith(`:${focusValue}`))
  )) ?? nodes.find((node) => node.slug === focusValue);
}

function limitToFocusNeighborhood(
  nodes: GraphNode[],
  edges: GraphEdge[],
  focus: string | undefined,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const focusNode = findFocusNode(nodes, focus);
  if (!focusNode) {
    const limitedNodeIds = new Set(nodes.slice(0, MAX_PREVIEW_NODES).map((node) => node.id));
    return {
      nodes: nodes.slice(0, MAX_PREVIEW_NODES),
      edges: edges.filter((edge) => limitedNodeIds.has(edge.source) && limitedNodeIds.has(edge.target)).slice(0, MAX_PREVIEW_EDGES),
    };
  }

  const directEdges = edges.filter((edge) => edge.source === focusNode.id || edge.target === focusNode.id);
  const keepIds = new Set<string>([focusNode.id]);
  directEdges.forEach((edge) => {
    keepIds.add(edge.source);
    keepIds.add(edge.target);
  });

  const neighborhood = [
    focusNode,
    ...nodes.filter((node) => node.id !== focusNode.id && keepIds.has(node.id)),
  ].slice(0, MAX_PREVIEW_NODES);
  const limitedIds = new Set(neighborhood.map((node) => node.id));

  return {
    nodes: neighborhood,
    edges: edges.filter((edge) => limitedIds.has(edge.source) && limitedIds.has(edge.target)).slice(0, MAX_PREVIEW_EDGES),
  };
}

export function normalizeGraphPayload(
  rawPayload: unknown,
  options: { focus?: string; safetyMode?: boolean } = {},
): GraphPayload {
  const record = asRecord(rawPayload);
  if (!record) {
    return {
      focus: normalizeGraphFocus(options.focus),
      nodes: [],
      edges: [],
      meta: { source: 'api', safetyMode: options.safetyMode },
    };
  }

  const rawNodes = Array.isArray(record.nodes) ? record.nodes : [];
  const rawEdges = Array.isArray(record.edges)
    ? record.edges
    : Array.isArray(record.links)
      ? record.links
      : [];
  const nodes = dedupeNodes(rawNodes.map(normalizeNode).filter((node): node is GraphNode => node !== null));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = dedupeEdges(rawEdges.map(normalizeEdge).filter((edge): edge is GraphEdge => (
    edge !== null && nodeIds.has(edge.source) && nodeIds.has(edge.target)
  )));
  const limited = limitToFocusNeighborhood(nodes, edges, options.focus);

  return {
    focus: normalizeGraphFocus(options.focus),
    nodes: limited.nodes,
    edges: limited.edges,
    meta: {
      source: 'api',
      safetyMode: options.safetyMode,
    },
  };
}

export function isCriticalInteractionEdge(edge: GraphEdge): boolean {
  return edge.type === 'interaction' && (edge.riskLevel === 'high' || edge.riskLevel === 'critical');
}
