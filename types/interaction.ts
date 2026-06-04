import type { InteractionSeverity } from './substance';

export type EvidenceLevel = 'strong' | 'moderate' | 'limited' | 'anecdotal';

export interface SubstanceSummary {
  slug: string;
  name: string;
  categories: string[];
}

export interface InteractionDetail {
  id: string;
  substanceA: string;
  substanceB: string;
  severity: InteractionSeverity;
  summary: string;
  mechanisms: string[];
  riskFactors: string[];
  evidence: EvidenceLevel;
  evidenceNote: string;
}
