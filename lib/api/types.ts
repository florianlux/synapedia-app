// ── Raw Synapedia API response types (v1) ─────────────────────────────────
// Matching the real synapedia.com/api/v1 response shapes.
// All fields optional to handle partial payloads gracefully.

export interface ApiSubstanceSummary {
  slug: string;
  name: string;
  class?: string | null;
  summary?: string | null;
  risk_level?: string | null;
  tags?: string[] | null;
  aliases?: string[] | null;
}

export interface ApiSubstanceDetail {
  slug: string;
  name: string;
  class?: string | null;
  risk_level?: string | null;
  summary?: string | null;
  tags?: string[] | null;
  // Paid tier only:
  onset?: string | null;
  duration?: string | null;
  stimulation?: number | string | null;
  empathy?: number | string | null;
  visuals?: number | string | null;
  body_load?: number | string | null;
  comedown?: number | string | null;
  risk_profile?: string | null;
  mechanisms?: string[] | null;
  receptors?: string[] | null;
  sources?: { label: string; url: string }[] | null;
}

// ── Search ─────────────────────────────────────────────────────────────────

export interface ApiSearchResponse {
  data?: ApiSubstanceSummary[] | null;
  results?: ApiSubstanceSummary[] | null;
}

// ── Substance detail ───────────────────────────────────────────────────────

export interface ApiSubstanceDetailResponse {
  data?: ApiSubstanceDetail | null;
  substance?: ApiSubstanceDetail | null;
}

// ── Interaction check ──────────────────────────────────────────────────────

export interface ApiResolvedSubstance {
  input: string;
  slug: string | null;
  name: string | null;
  class: string | null;
  matched: boolean;
}

export interface ApiConfidence {
  score: number;
  level: string; // "high" | "medium" | "low" | "none"
  evidence_basis: string; // "curated" | "class_based" | "unknown"
}

export interface ApiPharmacology {
  mechanisms: string[];
  explanation: string;
  harm_reduction: string[];
}

export interface ApiInteractionPair {
  pair: [string, string];
  names: [string, string];
  severity: string; // "high" | "moderate" | "low" | "unknown"
  risk_classification: string; // "dangerous" | "caution" | "low-risk" | "unknown"
  summary: string;
  confidence: ApiConfidence;
  pharmacology: ApiPharmacology | null;
  sources: { count: number; references: { label: string; url: string }[] };
  last_reviewed: string | null;
  warnings: string[];
}

export interface ApiInteractionCheckData {
  substances: ApiResolvedSubstance[];
  interactions: ApiInteractionPair[];
  pairs_checked: number;
  unresolved: string[];
}

export interface ApiInteractionCheckResponse {
  data?: ApiInteractionCheckData | null;
}
