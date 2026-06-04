import type { Substance } from '@/types/substance';

const mdma: Substance = {
  slug: 'mdma',
  name: 'MDMA',
  chemicalName: '3,4-Methylendioxymethamphetamin',
  categories: ['Empathogen', 'Stimulans'],
  riskLevel: 'moderate',
  riskLabel: 'Moderates Risiko',
  riskChips: ['Neurotoxizität', 'Überhitzung', 'Serotonin-Syndrom'],
  quickFacts: {
    onset: '30–60 min',
    peak: '1–2 h',
    duration: '3–5 h',
    afterEffects: '1–3 Tage',
  },
  dosage: {
    routes: [
      {
        name: 'Oral',
        ranges: [
          { label: 'Schwelle', value: '20–30 mg' },
          { label: 'Niedrig', value: '30–75 mg' },
          { label: 'Mittel', value: '75–125 mg' },
          { label: 'Hoch', value: '125–175 mg' },
          { label: 'Sehr hoch', value: '175+ mg' },
        ],
        disclaimer:
          'Körpergewicht, Toleranz und individuelle Empfindlichkeit beeinflussen die Wirkung erheblich.',
      },
      {
        name: 'Insuffliert',
        ranges: [
          { label: 'Schwelle', value: '10–20 mg' },
          { label: 'Niedrig', value: '20–50 mg' },
          { label: 'Mittel', value: '50–100 mg' },
          { label: 'Hoch', value: '100–150 mg' },
        ],
        disclaimer:
          'Nasale Anwendung führt zu schnellerem Wirkungseintritt aber kürzerer Wirkdauer.',
      },
    ],
  },
  duration: {
    phases: [
      { label: 'Onset', value: '30–60 min' },
      { label: 'Peak', value: '1–1.5 h' },
      { label: 'Comedown', value: '1–2 h' },
      { label: 'Nachwirkungen', value: '1–3 Tage' },
    ],
    total: '3–5 h',
  },
  effects: {
    positive: [
      'Euphorie',
      'Empathie & Verbundenheit',
      'Erhöhte Sinneswahrnehmung',
      'Gesteigerte Kommunikation',
      'Körperliches Wohlbefinden',
    ],
    neutral: [
      'Kieferspannung (Bruxismus)',
      'Erweiterte Pupillen',
      'Erhöhter Puls',
      'Appetitlosigkeit',
      'Erhöhte Körpertemperatur',
    ],
    negative: [
      'Übelkeit',
      'Kopfschmerzen',
      'Angst / Panik',
      'Verwirrung',
      'Schlaflosigkeit',
    ],
  },
  risks: {
    acute: [
      {
        name: 'Überhitzung',
        severity: 'high',
        description:
          'Besonders gefährlich in warmer Umgebung und bei körperlicher Anstrengung.',
      },
      {
        name: 'Serotonin-Syndrom',
        severity: 'high',
        description:
          'Potenziell lebensbedrohlich bei Kombination mit MAO-Hemmern oder SSRI.',
      },
      {
        name: 'Hyponatriämie',
        severity: 'moderate',
        description:
          'Wasservergiftung durch übermäßiges Trinken ohne Elektrolyte.',
      },
    ],
    longterm: [
      {
        name: 'Neurotoxizität',
        severity: 'high',
        description:
          'Mögliche Schädigung serotonerger Neuronen bei häufigem Konsum.',
      },
      {
        name: 'Depressive Verstimmung',
        severity: 'moderate',
        description:
          'Wochen nach Konsum durch Serotonin-Depletion möglich.',
      },
    ],
  },
  saferUse: [
    {
      title: 'Dosierung',
      description:
        'Max. 1.5 mg/kg Körpergewicht. Nachredosierungen vermeiden.',
    },
    {
      title: 'Pausen',
      description: 'Mindestens 6–8 Wochen zwischen Konsumanlässen.',
    },
    {
      title: 'Hydration',
      description: '250–500 ml Wasser pro Stunde, nicht mehr.',
    },
    {
      title: 'Temperatur',
      description: 'Regelmäßig abkühlen, Pausen vom Tanzen einlegen.',
    },
    {
      title: 'Testing',
      description:
        'Substanz vor Konsum mit Drug-Checking oder Reagenztest prüfen.',
    },
  ],
  interactions: [
    {
      substance: 'MAO-Hemmer',
      severity: 'lethal',
      description: 'Serotonin-Syndrom — potenziell tödlich',
    },
    {
      substance: 'SSRI / SNRI',
      severity: 'dangerous',
      description: 'Stark erhöhtes Serotonin-Syndrom-Risiko',
    },
    {
      substance: 'Tramadol',
      severity: 'dangerous',
      description: 'Senkt Krampfschwelle, Serotonin-Syndrom',
    },
    {
      substance: 'Alkohol',
      severity: 'risky',
      description: 'Erhöhte Dehydrierung und Lebertoxizität',
    },
    {
      substance: 'Cannabis',
      severity: 'caution',
      description: 'Verstärkt Verwirrung und Angst',
    },
  ],
  sources: [
    {
      author: 'Kalant, H.',
      year: 2001,
      title:
        'The pharmacology and toxicology of "ecstasy" (MDMA) and related drugs',
      doi: '10.1503/cmaj.081307',
    },
    {
      author: 'Parrott, A.C.',
      year: 2013,
      title:
        'Human psychobiology of MDMA or "Ecstasy": an overview of 25 years of empirical research',
      doi: '10.1177/0269881113493252',
    },
  ],
  lastUpdated: '2024-03-15',
};

const lsd: Substance = {
  slug: 'lsd',
  name: 'LSD',
  chemicalName: 'Lysergsäurediethylamid',
  categories: ['Psychedelikum', 'Halluzinogen'],
  riskLevel: 'moderate',
  riskLabel: 'Moderates Risiko',
  riskChips: ['Psychische Belastung', 'HPPD', 'Psychose-Trigger'],
  quickFacts: {
    onset: '20–60 min',
    peak: '2–4 h',
    duration: '8–12 h',
    afterEffects: '12–48 h',
  },
  dosage: {
    routes: [
      {
        name: 'Oral (Blotter)',
        ranges: [
          { label: 'Schwelle', value: '15–25 µg' },
          { label: 'Niedrig', value: '25–75 µg' },
          { label: 'Mittel', value: '75–150 µg' },
          { label: 'Hoch', value: '150–300 µg' },
          { label: 'Sehr hoch', value: '300+ µg' },
        ],
        disclaimer:
          'Blotter-Dosierungen variieren stark. Drug-Checking wird dringend empfohlen.',
      },
    ],
  },
  duration: {
    phases: [
      { label: 'Onset', value: '20–60 min' },
      { label: 'Peak', value: '2–4 h' },
      { label: 'Comedown', value: '2–4 h' },
      { label: 'Nachwirkungen', value: '12–48 h' },
    ],
    total: '8–12 h',
  },
  effects: {
    positive: [
      'Visuelle Intensivierung',
      'Tiefe Introspektion',
      'Synästhesie',
      'Kreativitätssteigerung',
      'Verbundenheitsgefühl',
    ],
    neutral: [
      'Erweiterte Pupillen',
      'Verändertes Zeitgefühl',
      'Veränderte Körperwahrnehmung',
      'Erhöhte Emotionalität',
    ],
    negative: [
      'Angst / Panikattacken',
      'Verwirrung / Desorientierung',
      'Paranoia',
      'Übelkeit (Onset)',
      'Schlaflosigkeit',
    ],
  },
  risks: {
    acute: [
      {
        name: 'Psychische Krise',
        severity: 'high',
        description:
          'Horrortrip möglich, besonders bei instabiler Stimmung oder unsicherem Setting.',
      },
      {
        name: 'Unfallgefahr',
        severity: 'moderate',
        description:
          'Stark veränderte Wahrnehmung kann zu gefährlichen Situationen führen.',
      },
    ],
    longterm: [
      {
        name: 'HPPD',
        severity: 'moderate',
        description:
          'Anhaltende visuelle Störungen nach Konsum, selten aber möglich.',
      },
      {
        name: 'Psychose-Trigger',
        severity: 'high',
        description:
          'Kann latente psychotische Störungen auslösen, besonders bei Prädisposition.',
      },
    ],
  },
  saferUse: [
    {
      title: 'Set & Setting',
      description:
        'Nur in sicherer, vertrauter Umgebung mit vertrauten Personen.',
    },
    {
      title: 'Tripsitter',
      description: 'Nüchterne Vertrauensperson sollte anwesend sein.',
    },
    {
      title: 'Dosierung',
      description:
        'Niedrig starten, nicht nachlegen. Wirkung kann bis zu 90 min auf sich warten lassen.',
    },
    {
      title: 'Keine Mischung',
      description:
        'Besonders nicht mit Cannabis — kann den Trip stark intensivieren.',
    },
    {
      title: 'Zeitplanung',
      description:
        '12+ Stunden einplanen. Am Folgetag keine wichtigen Termine.',
    },
  ],
  interactions: [
    {
      substance: 'Lithium',
      severity: 'lethal',
      description: 'Krampfanfälle und Bewusstlosigkeit möglich',
    },
    {
      substance: 'Cannabis',
      severity: 'risky',
      description: 'Stark unvorhersehbare Intensivierung',
    },
    {
      substance: 'SSRI',
      severity: 'caution',
      description: 'Deutlich abgeschwächte Wirkung',
    },
  ],
  sources: [
    {
      author: 'Passie, T. et al.',
      year: 2008,
      title:
        'The pharmacology of lysergic acid diethylamide: a review',
      doi: '10.1017/S1461145707008073',
    },
    {
      author: 'Liechti, M.E.',
      year: 2017,
      title: 'Modern Clinical Research on LSD',
      doi: '10.1038/npp.2017.86',
    },
  ],
  lastUpdated: '2024-02-28',
};

export const SUBSTANCES: Substance[] = [mdma, lsd];

export const SUBSTANCES_MAP: Record<string, Substance> = Object.fromEntries(
  SUBSTANCES.map((s) => [s.slug, s]),
);
