import type { InteractionSeverity } from './substance';

export type EvidenceLevel = 'strong' | 'moderate' | 'limited' | 'anecdotal';
export type MixCheckRiskLevel = 'low' | 'medium' | 'high' | 'critical' | 'unknown';

export interface SubstanceSummary {
  slug: string;
  name: string;
  categories: string[];
}

export interface InteractionDetail {
  id: string;
  substanceA: string;
  substanceB: string;
  title: string;
  riskLevel: MixCheckRiskLevel;
  severity: InteractionSeverity;
  summary: string;
  mechanisms: string[];
  riskFactors: string[];
  saferUseNotes: string[];
  redFlags: string[];
  evidence: EvidenceLevel;
  evidenceNote: string;
  sourceNote: string;
}
