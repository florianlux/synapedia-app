export type GuideSection = {
  title: string;
  items: string[];
};

export type GuidePhase = {
  label: string;
  description: string;
};

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  accent: string;
  safetyDisclaimer: string;
  symptoms: GuideSection[];
  phases: GuidePhase[];
  redFlags: string[];
  practicalSteps: string[];
  evidenceNote: string;
};

export const GUIDE_DISCLAIMER =
  'Nur Wissens- und Harm-Reduction-Kontext. Keine medizinische Beratung oder Notfallversorgung. Bei schweren Symptomen lokale Notfalldienste kontaktieren.';

export const GUIDES: Guide[] = [
  {
    slug: 'opioidentzug-entschaerfen',
    title: 'Opioidentzug entschärfen',
    summary:
      'Kuratierter Überblick zu typischen Entzugssymptomen, Support-Kontext und Eskalationspunkten bei opioidartigem Konsum.',
    category: 'Recovery Guide',
    accent: '#0A84FF',
    safetyDisclaimer:
      'Opioidentzug kann belastend sein. Bei Schwangerschaft, schweren Vorerkrankungen, Mischkonsum oder Suizidgedanken medizinische Hilfe holen.',
    symptoms: [
      {
        title: 'Häufige Symptome',
        items: ['Unruhe, Schwitzen, Frieren', 'Durchfall, Übelkeit, Bauchkrämpfe', 'Schlafprobleme, Schmerzen, Craving'],
      },
      {
        title: 'Support-Fokus',
        items: ['Flüssigkeit und Elektrolyte im Blick behalten', 'Ruhiges Umfeld und Begleitung organisieren', 'Rückfall- und akute Intoxikationsrisiken nach Pausen ernst nehmen'],
      },
    ],
    phases: [
      { label: 'Frühphase', description: 'Unruhe, Gähnen, Schwitzen und Craving können zunehmen.' },
      { label: 'Peak', description: 'Körperliche Symptome und Schlafmangel sind oft am stärksten.' },
      { label: 'Nachphase', description: 'Erschöpfung, Stimmungstief und Craving können anhalten.' },
    ],
    redFlags: [
      'Atemprobleme, Bewusstseinsstörung oder nicht weckbar',
      'Starke Dehydrierung, anhaltendes Erbrechen oder Kreislaufkollaps',
      'Suizidgedanken, akute Krise oder fehlende Unterstuetzung',
    ],
    practicalSteps: [
      'Nicht allein durch schwere Phasen gehen; eine informierte Person einbinden.',
      'Naloxon-Zugang und Wissen zu Atemnotfallzeichen im Umfeld prüfen.',
      'Keine Medikamente ohne ärztliche Rücksprache kombinieren.',
    ],
    evidenceNote: 'Lokaler kuratierter Inhalt. Quellen werden später transparent ergänzt.',
  },
  {
    slug: 'benzodiazepin-entzug',
    title: 'Benzodiazepin-Entzug',
    summary:
      'Überblick zu Risiken, Warnzeichen und Support-Kontext bei Benzodiazepin-Abhängigkeit oder Absetzsymptomen.',
    category: 'High-Risk Guide',
    accent: '#FF9F0A',
    safetyDisclaimer:
      'Benzodiazepin-Entzug kann gefährlich sein. Abruptes Absetzen kann Krampfanfälle auslösen; medizinische Begleitung ist wichtig.',
    symptoms: [
      {
        title: 'Häufige Symptome',
        items: ['Angst, Zittern, Schlaflosigkeit', 'Reizüberflutung, Herzrasen, Schwitzen', 'Rebound-Symptome und starke innere Unruhe'],
      },
      {
        title: 'Support-Fokus',
        items: ['Keine personalisierten Absetzpläne ohne medizinische Begleitung', 'Reizarmes Umfeld und Schlafschutz planen', 'Verlauf ehrlich dokumentieren'],
      },
    ],
    phases: [
      { label: 'Frühphase', description: 'Rebound-Angst, Schlafprobleme und Unruhe können auftreten.' },
      { label: 'Risikophase', description: 'Krampf- und Delirrisiken sind bei abruptem Absetzen besonders relevant.' },
      { label: 'Stabilisierung', description: 'Symptome können wellenförmig bleiben; professionelle Begleitung hilft.' },
    ],
    redFlags: [
      'Krampfanfall, Verwirrtheit, Halluzinationen oder Delirzeichen',
      'Suizidgedanken, starke Panik oder Kontrollverlust',
      'Abruptes Absetzen nach längerer oder intensiver Nutzung',
    ],
    practicalSteps: [
      'Ärztliche oder suchtmedizinische Begleitung suchen.',
      'Verlauf notieren, aber keine eigenen Absetzpläne erzwingen.',
      'Alkohol, Opioide und andere Downer nicht als Selbstmedikation nutzen.',
    ],
    evidenceNote: 'Lokaler kuratierter Inhalt. Medizinische Leitlinien und Quellen werden später verknüpft.',
  },
  {
    slug: 'phenibut-entzug-verstehen',
    title: 'Phenibut-Entzug verstehen',
    summary:
      'Kompakter Überblick zu Phenibut-Rebound, Entzugssymptomen und Support-Kontext ohne personalisierte Absetzpläne.',
    category: 'Curated Guide',
    accent: '#D63A4A',
    safetyDisclaimer:
      'Phenibut-Entzug kann psychisch und körperlich stark belasten. Bei schweren Symptomen oder Mischkonsum medizinische Hilfe holen.',
    symptoms: [
      {
        title: 'Häufige Symptome',
        items: ['Rebound-Angst, Schlaflosigkeit, innere Unruhe', 'Herzrasen, Schwitzen, Zittern', 'Derealisation, Stimmungseinbruch, Craving'],
      },
      {
        title: 'Support-Fokus',
        items: ['Langsamen Onset und lange Nachwirkung berücksichtigen', 'Keine Alkohol-/Benzodiazepin-Selbstmedikation ohne Hilfe', 'Unterstuetzung und Krisenplan vorbereiten'],
      },
    ],
    phases: [
      { label: 'Rebound', description: 'Angst und Schlaflosigkeit können nach Ende der Wirkung stark zurückkommen.' },
      { label: 'Akute Belastung', description: 'Unruhe, vegetative Symptome und Craving können sich zuspitzen.' },
      { label: 'Erholung', description: 'Schlaf und Stimmung können schrittweise stabiler werden, oft nicht linear.' },
    ],
    redFlags: [
      'Suizidgedanken, Psychosezeichen oder schwere Panik',
      'Krampfanfälle, starke Verwirrtheit oder Kontrollverlust',
      'Mischkonsum mit Alkohol, Benzodiazepinen, Opioiden oder anderen Downern',
    ],
    practicalSteps: [
      'Tage, ungefaehre Menge und Mischkonsum ehrlich dokumentieren.',
      'Professionelle Hilfe besonders bei täglicher oder intensiver Nutzung einplanen.',
      'Schlaf, Flüssigkeit, Ernährung und soziale Unterstützung priorisieren.',
    ],
    evidenceNote: 'Lokaler kuratierter Inhalt. Quellenlage wird später transparent markiert.',
  },
];

export const GUIDES_MAP: Record<string, Guide> = Object.fromEntries(
  GUIDES.map((guide) => [guide.slug, guide]),
);
