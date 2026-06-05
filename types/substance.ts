export type RiskLevel = 'low' | 'moderate' | 'high' | 'extreme' | 'unknown';

export type InteractionSeverity =
  | 'lethal'
  | 'dangerous'
  | 'risky'
  | 'caution'
  | 'low-risk';

export interface DoseRange {
  label: string;
  value: string;
}

export interface DoseRoute {
  name: string;
  ranges: DoseRange[];
  disclaimer?: string;
}

export interface DurationPhase {
  label: string;
  value: string;
}

export interface QuickFacts {
  onset: string;
  peak: string;
  duration: string;
  afterEffects: string;
}

export interface Risk {
  name: string;
  severity: RiskLevel;
  description: string;
}

export interface SaferUseTip {
  title: string;
  description: string;
}

export interface Interaction {
  substance: string;
  severity: InteractionSeverity;
  description: string;
}

export interface Source {
  author: string;
  year: number;
  title: string;
  doi?: string;
}

export interface Substance {
  slug: string;
  name: string;
  aliases?: string[];
  chemicalName: string;
  primaryClass?: string;
  summary?: string;
  categories: string[];
  riskLevel: RiskLevel;
  riskLabel: string;
  riskChips: string[];
  quickFacts: QuickFacts;
  dosage: {
    routes: DoseRoute[];
  };
  duration: {
    phases: DurationPhase[];
    total: string;
  };
  effects: {
    positive: string[];
    neutral: string[];
    negative: string[];
  };
  risks: {
    acute: Risk[];
    longterm: Risk[];
  };
  saferUse: SaferUseTip[];
  warnings: string[];
  mechanisms: string[];
  interactions: Interaction[];
  interactionsPreview?: Interaction[];
  sources: Source[];
  evidenceNote?: string;
  lastUpdated: string;
}
