export type GraphNodeType =
  | 'substance'
  | 'receptor'
  | 'effect'
  | 'mechanism'
  | 'interaction'
  | 'article';

export type GraphRiskLevel =
  | 'low'
  | 'moderate'
  | 'high'
  | 'critical'
  | 'unknown';

export type GraphEdgeType =
  | 'similar'
  | 'binds_to'
  | 'causes_effect'
  | 'interaction'
  | 'mechanism'
  | 'mentioned_in';

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  slug?: string;
  riskLevel?: GraphRiskLevel;
  classPrimary?: string;
  confidence?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: GraphEdgeType;
  label?: string;
  riskLevel?: GraphRiskLevel;
  weight?: number;
}

export interface GraphPayload {
  focus?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  meta?: {
    source: 'api' | 'fallback';
    generatedAt?: string;
    safetyMode?: boolean;
  };
}
