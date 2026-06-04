import type { RiskLevel, Substance } from '@/types/substance';

type SubstanceSeed = {
  slug: string;
  name: string;
  aliases: string[];
  chemicalName: string;
  primaryClass: string;
  categories: string[];
  summary: string;
  riskLevel: RiskLevel;
  riskChips: string[];
  quickFacts: {
    onset: string;
    peak: string;
    duration: string;
    afterEffects: string;
  };
  effects: {
    positive: string[];
    neutral: string[];
    negative: string[];
  };
  acuteRisks: string[];
  longtermRisks: string[];
  saferUse: string[];
  interactions: {
    substance: string;
    severity: Substance['interactions'][number]['severity'];
    description: string;
  }[];
};

const riskLabels: Record<RiskLevel, string> = {
  low: 'Geringes Risiko',
  moderate: 'Moderates Risiko',
  high: 'Hohes Risiko',
  extreme: 'Extremes Risiko',
  unknown: 'Unbekanntes Risiko',
};

const evidencePlaceholder = {
  author: 'Synapedia Redaktion',
  year: 2026,
  title: 'Lokaler MVP-Datensatz: Evidence-Mapping und Quellenpruefung ausstehend.',
};

function makeSubstance(seed: SubstanceSeed): Substance {
  return {
    slug: seed.slug,
    name: seed.name,
    aliases: seed.aliases,
    chemicalName: seed.chemicalName,
    primaryClass: seed.primaryClass,
    summary: seed.summary,
    categories: seed.categories,
    riskLevel: seed.riskLevel,
    riskLabel: riskLabels[seed.riskLevel],
    riskChips: seed.riskChips,
    quickFacts: seed.quickFacts,
    dosage: { routes: [] },
    duration: {
      phases: [
        { label: 'Onset', value: seed.quickFacts.onset },
        { label: 'Peak', value: seed.quickFacts.peak },
        { label: 'Gesamt', value: seed.quickFacts.duration },
        { label: 'Nachwirkungen', value: seed.quickFacts.afterEffects },
      ],
      total: seed.quickFacts.duration,
    },
    effects: seed.effects,
    risks: {
      acute: seed.acuteRisks.map((risk) => ({
        name: risk,
        severity: seed.riskLevel === 'extreme' ? 'high' : seed.riskLevel,
        description: 'Kurzbeschreibung fuer den lokalen MVP-Datensatz. Inhalt wird kuratiert.',
      })),
      longterm: seed.longtermRisks.map((risk) => ({
        name: risk,
        severity: seed.riskLevel === 'low' ? 'moderate' : seed.riskLevel,
        description: 'Langzeitkontext fuer den lokalen MVP-Datensatz. Inhalt wird kuratiert.',
      })),
    },
    saferUse: seed.saferUse.map((tip) => ({
      title: tip,
      description: 'Harm-Reduction-Hinweis als Platzhalter; medizinische Abklaerung bleibt wichtig.',
    })),
    interactions: seed.interactions,
    sources: [evidencePlaceholder],
    lastUpdated: '2026-06-05',
  };
}

const seeds: SubstanceSeed[] = [
  {
    slug: 'mdma',
    name: 'MDMA',
    aliases: ['Ecstasy', 'Molly', 'Emma'],
    chemicalName: '3,4-Methylendioxymethamphetamin',
    primaryClass: 'Empathogen',
    categories: ['Empathogen', 'Stimulans'],
    summary: 'Empathogen-stimulierende Substanz mit starkem Serotoninbezug und relevanten Risiken durch Hitze, Dehydrierung und Mischkonsum.',
    riskLevel: 'moderate',
    riskChips: ['Serotonin', 'Ueberhitzung', 'Nachdosierung'],
    quickFacts: { onset: '30-60 min', peak: '1-2 h', duration: '3-5 h', afterEffects: '1-3 Tage' },
    effects: {
      positive: ['Euphorie', 'Empathie', 'Kontaktfreude'],
      neutral: ['Kieferspannung', 'Erhoehter Puls', 'Appetitlosigkeit'],
      negative: ['Ueberhitzung', 'Angst', 'Schlafprobleme'],
    },
    acuteRisks: ['Ueberhitzung', 'Hyponatriaemie', 'Serotonin-Syndrom'],
    longtermRisks: ['Stimmungstiefs', 'Schlafprobleme', 'Belastung bei haeufigem Konsum'],
    saferUse: ['Drug-Checking nutzen', 'Kuehlpausen einlegen', 'Mischkonsum vermeiden'],
    interactions: [
      { substance: 'MAO-Hemmer', severity: 'lethal', description: 'Stark erhoehtes Risiko serotonerger Toxizitaet.' },
      { substance: 'SSRI/SNRI', severity: 'dangerous', description: 'Unvorhersehbare Wirkung und Serotonin-Risiko.' },
      { substance: 'Alkohol', severity: 'risky', description: 'Erhoeht Dehydrierung und Fehlentscheidungen.' },
    ],
  },
  {
    slug: 'lsd',
    name: 'LSD',
    aliases: ['Acid', 'Lucy', 'Pappen'],
    chemicalName: 'Lysergsaeurediethylamid',
    primaryClass: 'Psychedelikum',
    categories: ['Psychedelikum', 'Halluzinogen'],
    summary: 'Lang wirkendes Psychedelikum mit starkem Einfluss auf Wahrnehmung, Denken und Setting-Sensitivitaet.',
    riskLevel: 'moderate',
    riskChips: ['Set & Setting', 'Panik', 'Lange Dauer'],
    quickFacts: { onset: '20-60 min', peak: '2-4 h', duration: '8-12 h', afterEffects: '12-48 h' },
    effects: {
      positive: ['Intensivierte Wahrnehmung', 'Einsichtserleben', 'Staunen'],
      neutral: ['Zeitverzerrung', 'Mydriasis', 'Koerperliche Unruhe'],
      negative: ['Angst', 'Verwirrung', 'Psychische Ueberforderung'],
    },
    acuteRisks: ['Panikreaktionen', 'Unfaelle durch Fehleinschaetzung', 'Psychische Krise'],
    longtermRisks: ['Persistierende Belastung', 'HPPD-aehnliche Symptome', 'Trigger bei Vulnerabilitaet'],
    saferUse: ['Sicheres Setting planen', 'Tripsitter erwaegen', 'Nicht in Krisen konsumieren'],
    interactions: [
      { substance: 'Cannabis', severity: 'risky', description: 'Kann Trip deutlich und unvorhersehbar verstaerken.' },
      { substance: 'Lithium', severity: 'dangerous', description: 'Berichte ueber schwere Reaktionen; vermeiden.' },
    ],
  },
  {
    slug: 'ketamin',
    name: 'Ketamin',
    aliases: ['K', 'Special K', 'Ket'],
    chemicalName: 'Ketamin',
    primaryClass: 'Dissoziativum',
    categories: ['Dissoziativum', 'Anaesthetikum'],
    summary: 'Dissoziative Substanz mit starker Beeintraechtigung von Koordination, Orientierung und Koerperwahrnehmung.',
    riskLevel: 'moderate',
    riskChips: ['Dissoziation', 'Sturzrisiko', 'Blase'],
    quickFacts: { onset: '5-20 min', peak: '20-60 min', duration: '45-120 min', afterEffects: '2-6 h' },
    effects: {
      positive: ['Dissoziation', 'Analgesie', 'Entkopplung vom Koerper'],
      neutral: ['Koordinationsstoerung', 'Taubheitsgefuehl', 'Uebelkeit'],
      negative: ['Orientierungsverlust', 'Erbrechen', 'Angst im K-Hole'],
    },
    acuteRisks: ['Stuerze', 'Aspiration bei Erbrechen', 'Orientierungsverlust'],
    longtermRisks: ['Blasenprobleme', 'Toleranz', 'Abhaengigkeitsmuster'],
    saferUse: ['Sitzendes/liegendes Setting', 'Nicht mit Downern kombinieren', 'Pausen einhalten'],
    interactions: [
      { substance: 'Alkohol', severity: 'dangerous', description: 'Erhoeht Sedierung, Erbrechen und Unfallrisiko.' },
      { substance: 'Benzodiazepine', severity: 'risky', description: 'Verstaerkt Sedierung und Erinnerungsluecken.' },
    ],
  },
  {
    slug: 'kokain',
    name: 'Kokain',
    aliases: ['Cocaine', 'Koks', 'Coke'],
    chemicalName: 'Benzoylecgoninmethylester',
    primaryClass: 'Stimulans',
    categories: ['Stimulans'],
    summary: 'Kurz wirkendes Stimulans mit hoher Herz-Kreislauf-Belastung und relevantem Craving-/Nachdosierungsrisiko.',
    riskLevel: 'high',
    riskChips: ['Herz-Kreislauf', 'Craving', 'Alkohol'],
    quickFacts: { onset: '1-10 min', peak: '15-30 min', duration: '30-90 min', afterEffects: '1-24 h' },
    effects: {
      positive: ['Energie', 'Selbstvertrauen', 'Wachheit'],
      neutral: ['Appetitminderung', 'Erhoehter Puls', 'Rededrang'],
      negative: ['Angst', 'Brustschmerz', 'Reizbarkeit'],
    },
    acuteRisks: ['Herzrhythmusstoerungen', 'Blutdruckspitzen', 'Ueberdosierung'],
    longtermRisks: ['Abhaengigkeit', 'Nasenschaeden', 'Herz-Kreislauf-Belastung'],
    saferUse: ['Alkohol vermeiden', 'Nachdosieren begrenzen', 'Bei Brustschmerz Notfallhilfe'],
    interactions: [
      { substance: 'Alkohol', severity: 'dangerous', description: 'Cocaethylen-Bildung erhoeht Herz- und Leberrisiken.' },
      { substance: 'MDMA', severity: 'dangerous', description: 'Additive Stimulation und Ueberhitzungsrisiko.' },
    ],
  },
  {
    slug: 'cannabis',
    name: 'Cannabis',
    aliases: ['THC', 'Weed', 'Gras'],
    chemicalName: 'Cannabinoid-Gemisch',
    primaryClass: 'Cannabinoid',
    categories: ['Cannabinoid'],
    summary: 'Cannabinoid mit variabler Wirkung je nach THC/CBD-Verhaeltnis, Dosis, Route und individueller Empfindlichkeit.',
    riskLevel: 'moderate',
    riskChips: ['Angst', 'Psychose-Trigger', 'Koordination'],
    quickFacts: { onset: '1-90 min', peak: '30-180 min', duration: '2-8 h', afterEffects: 'bis 24 h' },
    effects: {
      positive: ['Entspannung', 'Appetit', 'Sinnesintensivierung'],
      neutral: ['Trockener Mund', 'Rote Augen', 'Zeitverzerrung'],
      negative: ['Angst', 'Paranoia', 'Gedaechtnisprobleme'],
    },
    acuteRisks: ['Panik', 'Koordinationsprobleme', 'Unfallrisiko'],
    longtermRisks: ['Abhaengigkeitsmuster', 'Motivationsprobleme', 'Psychische Belastung bei Vulnerabilitaet'],
    saferUse: ['Langsam titrieren', 'Nicht fahren', 'Bei Angst Reize reduzieren'],
    interactions: [
      { substance: 'LSD', severity: 'risky', description: 'Kann psychedelische Wirkung stark intensivieren.' },
      { substance: 'Alkohol', severity: 'risky', description: 'Mehr Uebelkeit, Schwindel und Kontrollverlust.' },
    ],
  },
  {
    slug: 'kratom',
    name: 'Kratom',
    aliases: ['Mitragyna speciosa', 'Mitragynin'],
    chemicalName: 'Mitragynin / 7-Hydroxymitragynin',
    primaryClass: 'Opioid-artig',
    categories: ['Opioid-artig', 'Pflanzlich'],
    summary: 'Pflanzliche Substanz mit opioidartigen Effekten; Risiken betreffen Abhaengigkeit, Entzug und Mischkonsum mit Downern.',
    riskLevel: 'high',
    riskChips: ['Abhaengigkeit', 'Entzug', 'Sedierung'],
    quickFacts: { onset: '20-60 min', peak: '1-2 h', duration: '3-6 h', afterEffects: '6-24 h' },
    effects: {
      positive: ['Schmerzlinderung', 'Entspannung', 'Stimmungshebung'],
      neutral: ['Juckreiz', 'Uebelkeit', 'Schwitzen'],
      negative: ['Sedierung', 'Abhaengigkeit', 'Entzugssymptome'],
    },
    acuteRisks: ['Uebelkeit/Erbrechen', 'Sedierung', 'Atemdepression bei Mischkonsum'],
    longtermRisks: ['Toleranz', 'Abhaengigkeit', 'Entzug'],
    saferUse: ['Nicht mit Downern kombinieren', 'Pausen planen', 'Entzug ernst nehmen'],
    interactions: [
      { substance: 'Alkohol', severity: 'dangerous', description: 'Verstaerkt Sedierung und Atemrisiken.' },
      { substance: 'Benzodiazepine', severity: 'dangerous', description: 'Downer-Kombination mit erhoehtem Atemrisiko.' },
    ],
  },
  {
    slug: 'odsmt',
    name: 'O-DSMT',
    aliases: ['O-Desmethyltramadol', 'ODSMT'],
    chemicalName: 'O-Desmethyltramadol',
    primaryClass: 'Opioid',
    categories: ['Opioid'],
    summary: 'Opioider Tramadol-Metabolit mit Abhaengigkeits-, Sedierungs- und Atemdepressionsrisiken, besonders in Kombination.',
    riskLevel: 'high',
    riskChips: ['Atemdepression', 'Toleranz', 'Entzug'],
    quickFacts: { onset: '30-90 min', peak: '2-4 h', duration: '4-8 h', afterEffects: '8-24 h' },
    effects: {
      positive: ['Analgesie', 'Waerme', 'Entspannung'],
      neutral: ['Juckreiz', 'Miosis', 'Verstopfung'],
      negative: ['Atemdepression', 'Uebelkeit', 'Abhaengigkeit'],
    },
    acuteRisks: ['Atemdepression', 'Ueberdosierung', 'Bewusstseinsverlust'],
    longtermRisks: ['Toleranz', 'Abhaengigkeit', 'Entzug'],
    saferUse: ['Keine Downer-Kombinationen', 'Naloxon-Zugang erwaegen', 'Nicht allein konsumieren'],
    interactions: [
      { substance: 'Alkohol', severity: 'dangerous', description: 'Erhoeht Atemdepressions- und Bewusstlosigkeitsrisiko.' },
      { substance: 'Benzodiazepine', severity: 'dangerous', description: 'Besonders riskante Downer-Kombination.' },
    ],
  },
  {
    slug: 'phenibut',
    name: 'Phenibut',
    aliases: ['Beta-phenyl-GABA', 'Phen'],
    chemicalName: 'beta-Phenyl-gamma-aminobuttersaeure',
    primaryClass: 'GABAerg',
    categories: ['GABAerg', 'Anxiolytisch'],
    summary: 'GABAerge Substanz mit langem Wirkspektrum, hohem Toleranzrisiko und potenziell schwerem Entzug.',
    riskLevel: 'high',
    riskChips: ['Toleranz', 'Entzug', 'Sedierung'],
    quickFacts: { onset: '2-4 h', peak: '4-6 h', duration: '12-24 h', afterEffects: '24-48 h' },
    effects: {
      positive: ['Angstloesung', 'Entspannung', 'Soziale Offenheit'],
      neutral: ['Schlaefrigkeit', 'Schwindel', 'Motorische Daempfung'],
      negative: ['Rebound-Angst', 'Entzug', 'Blackouts bei Mischkonsum'],
    },
    acuteRisks: ['Starke Sedierung', 'Blackouts', 'Unfallrisiko'],
    longtermRisks: ['Toleranz', 'Abhaengigkeit', 'Schwerer Entzug'],
    saferUse: ['Nicht taeglich verwenden', 'Nicht abrupt absetzen', 'Keine Downer-Kombination'],
    interactions: [
      { substance: 'Alkohol', severity: 'dangerous', description: 'Additive Sedierung und Blackout-Risiko.' },
      { substance: 'Benzodiazepine', severity: 'dangerous', description: 'Stark erhoehte Daempfung.' },
    ],
  },
  {
    slug: 'diazepam',
    name: 'Diazepam',
    aliases: ['Valium', 'Benzodiazepin', 'BZD'],
    chemicalName: 'Diazepam',
    primaryClass: 'Benzodiazepin',
    categories: ['Benzodiazepin', 'Sedativum'],
    summary: 'Lang wirkendes Benzodiazepin mit Sedierungs-, Abhaengigkeits- und Entzugsrisiken; Mischkonsum mit Downern ist besonders kritisch.',
    riskLevel: 'high',
    riskChips: ['Sedierung', 'Abhaengigkeit', 'Entzug'],
    quickFacts: { onset: '15-60 min', peak: '1-2 h', duration: '6-24 h', afterEffects: '1-3 Tage' },
    effects: {
      positive: ['Angstloesung', 'Muskelentspannung', 'Sedierung'],
      neutral: ['Reaktionsverlangsamung', 'Amnesie', 'Koordinationsstoerung'],
      negative: ['Atemrisiko bei Mischkonsum', 'Abhaengigkeit', 'Entzug'],
    },
    acuteRisks: ['Unfaelle', 'Amnesie', 'Atemdepression bei Mischkonsum'],
    longtermRisks: ['Toleranz', 'Abhaengigkeit', 'Krampfrisiko bei Entzug'],
    saferUse: ['Nicht mit Alkohol/Opioiden kombinieren', 'Nicht abrupt absetzen', 'Fahren vermeiden'],
    interactions: [
      { substance: 'Alkohol', severity: 'dangerous', description: 'Stark erhoehtes Risiko fuer Blackouts und Atemprobleme.' },
      { substance: 'Opioide', severity: 'dangerous', description: 'Additive Atemdepression.' },
    ],
  },
  {
    slug: 'alkohol',
    name: 'Alkohol',
    aliases: ['Ethanol', 'Alcohol', 'EtOH'],
    chemicalName: 'Ethanol',
    primaryClass: 'Depressivum',
    categories: ['Depressivum'],
    summary: 'Legale sedierende Substanz mit hoher Mischkonsum-Relevanz, Unfallrisiken und erheblichem Langzeit-Schadenspotenzial.',
    riskLevel: 'high',
    riskChips: ['Mischkonsum', 'Leber', 'Unfaelle'],
    quickFacts: { onset: '5-30 min', peak: '30-90 min', duration: '2-8 h', afterEffects: '8-24 h' },
    effects: {
      positive: ['Enthemmung', 'Entspannung', 'Soziale Lockerung'],
      neutral: ['Koordinationsstoerung', 'Reaktionszeit sinkt', 'Harndrang'],
      negative: ['Uebelkeit', 'Blackouts', 'Atemrisiko bei Mischkonsum'],
    },
    acuteRisks: ['Alkoholvergiftung', 'Unfaelle', 'Gewalt-/Risikoverhalten'],
    longtermRisks: ['Lebererkrankungen', 'Abhaengigkeit', 'Kognitive Belastung'],
    saferUse: ['Langsam trinken', 'Nicht fahren', 'Nicht mit Downern kombinieren'],
    interactions: [
      { substance: 'Kokain', severity: 'dangerous', description: 'Cocaethylen-Bildung und erhoehtes Herzrisiko.' },
      { substance: 'Benzodiazepine/Opioide', severity: 'dangerous', description: 'Additive Daempfung und Atemrisiken.' },
    ],
  },
];

export const SUBSTANCES: Substance[] = seeds.map(makeSubstance);

export const SUBSTANCES_MAP: Record<string, Substance> = Object.fromEntries(
  SUBSTANCES.map((substance) => [substance.slug, substance]),
);
