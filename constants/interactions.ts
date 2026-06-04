import type { SubstanceSummary, InteractionDetail } from '@/types/interaction';

// ---------------------------------------------------------------------------
// Substance list for the picker (lightweight — no full detail data needed)
// ---------------------------------------------------------------------------

export const SUBSTANCE_LIST: SubstanceSummary[] = [
  { slug: 'mdma', name: 'MDMA', categories: ['Empathogen', 'Stimulans'] },
  { slug: 'lsd', name: 'LSD', categories: ['Psychedelikum'] },
  { slug: 'ketamin', name: 'Ketamin', categories: ['Dissoziativum'] },
  { slug: 'alkohol', name: 'Alkohol', categories: ['Depressivum'] },
  { slug: 'cannabis', name: 'Cannabis', categories: ['Cannabinoid'] },
  { slug: 'kokain', name: 'Kokain', categories: ['Stimulans'] },
  { slug: 'psilocybin', name: 'Psilocybin', categories: ['Psychedelikum'] },
  { slug: 'amphetamin', name: 'Amphetamin', categories: ['Stimulans'] },
];

export const SUBSTANCE_NAME_MAP: Record<string, string> = Object.fromEntries(
  SUBSTANCE_LIST.map((s) => [s.slug, s.name]),
);

// ---------------------------------------------------------------------------
// Interaction data
// ---------------------------------------------------------------------------

function makeKey(a: string, b: string): string {
  return [a, b].sort().join('+');
}

const INTERACTIONS: InteractionDetail[] = [
  // ── MDMA + LSD (Candyflip) ──────────────────────────────────────────────
  {
    id: makeKey('mdma', 'lsd'),
    substanceA: 'mdma',
    substanceB: 'lsd',
    severity: 'risky',
    summary:
      'Die Kombination von MDMA und LSD intensiviert beide Wirkungen erheblich und erhöht die psychische und körperliche Belastung.',
    mechanisms: [
      'MDMA erhöht Serotonin massiv, LSD aktiviert Serotonin-Rezeptoren direkt — doppelte serotonerge Stimulation',
      'Beide Substanzen erhöhen Herzfrequenz und Blutdruck additiv',
      'Erhöhtes Risiko für psychische Überforderung durch gleichzeitige empathogene und psychedelische Wirkung',
    ],
    riskFactors: [
      'Hohe Dosierung einer oder beider Substanzen',
      'Warme Umgebung oder körperliche Anstrengung',
      'Psychische Vorbelastung oder instabiles Setting',
      'Nachdosierung von MDMA während des LSD-Trips',
    ],
    evidence: 'moderate',
    evidenceNote:
      'Basierend auf pharmakologischer Analyse und klinischen Fallberichten. Keine kontrollierten Studien zu dieser Kombination.',
  },

  // ── MDMA + Alkohol ──────────────────────────────────────────────────────
  {
    id: makeKey('mdma', 'alkohol'),
    substanceA: 'mdma',
    substanceB: 'alkohol',
    severity: 'risky',
    summary:
      'Alkohol maskiert die MDMA-Wirkung und erhöht Dehydrierung, Lebertoxizität und riskantes Verhalten.',
    mechanisms: [
      'Alkohol senkt die Wahrnehmung der MDMA-Wirkung — Risiko der Überdosierung steigt',
      'Beide Substanzen wirken stark dehydrierend, was Überhitzung begünstigt',
      'Erhöhte Lebertoxizität durch gleichzeitigen Metabolismus',
    ],
    riskFactors: [
      'Hoher Alkoholkonsum vor oder während der MDMA-Wirkung',
      'Warme Umgebung (Club, Festival)',
      'Unzureichende Flüssigkeitszufuhr',
    ],
    evidence: 'moderate',
    evidenceNote:
      'Gut dokumentiert durch epidemiologische Daten und toxikologische Analysen.',
  },

  // ── MDMA + Kokain ──────────────────────────────────────────────────────
  {
    id: makeKey('mdma', 'kokain'),
    substanceA: 'mdma',
    substanceB: 'kokain',
    severity: 'dangerous',
    summary:
      'Beide Substanzen belasten das Herz-Kreislauf-System stark. Die Kombination erhöht das Risiko für Herzrhythmusstörungen und Überhitzung erheblich.',
    mechanisms: [
      'Additive sympathomimetische Wirkung: beide erhöhen Herzfrequenz, Blutdruck und Körpertemperatur',
      'Kokain blockiert die Serotonin-Wiederaufnahme zusätzlich — verstärkt serotonerge Toxizität',
      'Kokain kann die MDMA-Wirkung subjektiv abschwächen, was zu Nachdosierung verleitet',
    ],
    riskFactors: [
      'Vorerkrankungen des Herz-Kreislauf-Systems',
      'Hohe Dosierungen',
      'Längere Sessions mit Nachdosierung',
      'Kombination mit Alkohol als dritter Substanz',
    ],
    evidence: 'moderate',
    evidenceNote:
      'Basierend auf Notaufnahme-Daten und pharmakologischer Analyse.',
  },

  // ── LSD + Cannabis ──────────────────────────────────────────────────────
  {
    id: makeKey('lsd', 'cannabis'),
    substanceA: 'lsd',
    substanceB: 'cannabis',
    severity: 'risky',
    summary:
      'Cannabis kann die psychedelische Wirkung von LSD stark und unvorhersehbar intensivieren — besonders Angst und Verwirrung.',
    mechanisms: [
      'THC verstärkt die serotonerge Signalübertragung und potenziert visuelle und kognitive Effekte von LSD',
      'Cannabis kann Angst und Paranoia auslösen, die unter LSD-Einfluss eskalieren können',
      'Die Kombination macht den Trip deutlich unvorhersehbarer',
    ],
    riskFactors: [
      'Cannabis-Konsum während des LSD-Peaks',
      'Hohe THC-Konzentration',
      'Keine Erfahrung mit Psychedelika',
      'Unsicheres Setting',
    ],
    evidence: 'limited',
    evidenceNote:
      'Basierend auf Nutzererfahrungen und begrenzten pharmakologischen Daten. Keine klinischen Studien.',
  },

  // ── Kokain + Alkohol ────────────────────────────────────────────────────
  {
    id: makeKey('kokain', 'alkohol'),
    substanceA: 'kokain',
    substanceB: 'alkohol',
    severity: 'dangerous',
    summary:
      'Der Körper bildet Cocaethylen — einen toxischen Metaboliten, der das Risiko für plötzlichen Herztod deutlich erhöht.',
    mechanisms: [
      'In der Leber entsteht Cocaethylen, das kardiotoxischer ist als Kokain allein',
      'Alkohol verlängert die Kokain-Wirkung und maskiert die Intoxikation',
      'Stark erhöhte Belastung für Herz und Leber',
    ],
    riskFactors: [
      'Regelmäßiger kombinierter Konsum',
      'Hohe Mengen Alkohol',
      'Vorerkrankungen des Herzens',
      'Nachdosierung über mehrere Stunden',
    ],
    evidence: 'strong',
    evidenceNote:
      'Cocaethylen-Bildung ist gut durch klinische Studien belegt. Eine der am besten erforschten Drogen-Interaktionen.',
  },

  // ── MDMA + Ketamin ──────────────────────────────────────────────────────
  {
    id: makeKey('mdma', 'ketamin'),
    substanceA: 'mdma',
    substanceB: 'ketamin',
    severity: 'caution',
    summary:
      'Die Kombination kann die Orientierung stark beeinträchtigen. Ketamin kann die MDMA-induzierte Hyperthermie verstärken.',
    mechanisms: [
      'Ketamin verstärkt die dissoziative Komponente und kann zu starkem Orientierungsverlust führen',
      'Beide Substanzen beeinflussen die Thermoregulation',
      'Übelkeit und Kreislaufprobleme treten häufiger auf',
    ],
    riskFactors: [
      'Hohe Ketamin-Dosis (K-Hole-Risiko)',
      'Warme Umgebung',
      'Keine Erfahrung mit Dissoziativa',
    ],
    evidence: 'limited',
    evidenceNote:
      'Begrenzte Datenlage. Erfahrungsberichte und einzelne klinische Beobachtungen.',
  },
];

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

const INTERACTIONS_MAP: Record<string, InteractionDetail> = Object.fromEntries(
  INTERACTIONS.map((i) => [i.id, i]),
);

export function findInteraction(
  slugA: string,
  slugB: string,
): InteractionDetail | null {
  const key = makeKey(slugA, slugB);
  return INTERACTIONS_MAP[key] ?? null;
}
