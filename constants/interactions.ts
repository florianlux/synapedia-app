import type { SubstanceSummary, InteractionDetail } from '@/types/interaction';
import { SUBSTANCES } from '@/constants/mock-data';

// ---------------------------------------------------------------------------
// Substance list for the picker (lightweight — no full detail data needed)
// ---------------------------------------------------------------------------

export const SUBSTANCE_LIST: SubstanceSummary[] = SUBSTANCES.map((substance) => ({
  slug: substance.slug,
  name: substance.name,
  categories: substance.categories,
}));

export const SUBSTANCE_NAME_MAP: Record<string, string> = Object.fromEntries(
  SUBSTANCE_LIST.map((s) => [s.slug, s.name]),
);

// ---------------------------------------------------------------------------
// Interaction data
// ---------------------------------------------------------------------------

function makeKey(a: string, b: string): string {
  return [a, b].sort().join('+');
}

export const POPULAR_INTERACTION_PAIRS = [
  { label: 'MDMA + LSD', slugs: ['mdma', 'lsd'] },
  { label: 'Kokain + Alkohol', slugs: ['kokain', 'alkohol'] },
  { label: 'Ketamin + Alkohol', slugs: ['ketamin', 'alkohol'] },
  { label: 'Cannabis + LSD', slugs: ['cannabis', 'lsd'] },
  { label: 'MDMA + Kokain', slugs: ['mdma', 'kokain'] },
  { label: 'Kratom + Benzodiazepine/Diazepam', slugs: ['kratom', 'diazepam'] },
  { label: 'O-DSMT + Diazepam', slugs: ['odsmt', 'diazepam'] },
  { label: 'Phenibut + Alkohol', slugs: ['phenibut', 'alkohol'] },
] as const;

const INTERACTIONS: InteractionDetail[] = [
  {
    id: makeKey('mdma', 'lsd'),
    substanceA: 'mdma',
    substanceB: 'lsd',
    title: 'MDMA + LSD',
    riskLevel: 'high',
    severity: 'risky',
    summary:
      'Die Kombination kann euphorische und psychedelische Effekte deutlich verstaerken und die psychische sowie koerperliche Belastung erhoehen.',
    mechanisms: [
      'Serotonerge Stimulation durch MDMA plus psychedelische 5-HT2A-Aktivitaet.',
      'Additive Belastung fuer Herzfrequenz, Blutdruck und Temperaturregulation.',
      'Laengere LSD-Wirkdauer kann MDMA-Comedown und Verwirrung verstaerken.',
    ],
    riskFactors: [
      'Hohe Dosen oder Nachlegen',
      'Warmes, reizintensives Setting',
      'Angst, Panik oder instabile psychische Lage',
    ],
    saferUseNotes: [
      'Dosen niedrig halten und nicht gleichzeitig nachlegen.',
      'Kuehlpausen, Elektrolyte und ruhiges Setting einplanen.',
      'Eine nuechterne Vertrauensperson kann Eskalationen frueh erkennen.',
    ],
    redFlags: [
      'Verwirrtheit, Ueberhitzung, Kollaps oder Krampfanfall.',
      'Brustschmerz, Atemnot oder anhaltende Panik mit Kontrollverlust.',
    ],
    evidence: 'moderate',
    evidenceNote: 'Lokale kuratierte MVP-Bewertung; vollstaendige Quellenpruefung folgt.',
    sourceNote: 'Evidence/source placeholder: pharmakologische Plausibilitaet plus Harm-Reduction-Konsens.',
  },
  {
    id: makeKey('kokain', 'alkohol'),
    substanceA: 'kokain',
    substanceB: 'alkohol',
    title: 'Kokain + Alkohol',
    riskLevel: 'critical',
    severity: 'dangerous',
    summary:
      'Diese Kombination bildet Cocaethylen und erhoeht Herz-Kreislauf-, Leber- und Risikoverhaltensbelastung deutlich.',
    mechanisms: [
      'In der Leber entsteht Cocaethylen, ein toxischer und laenger wirksamer Metabolit.',
      'Alkohol maskiert Kokain-Intoxikation und Kokain maskiert Alkohol-Sedierung.',
      'Additive Belastung fuer Herz, Blutdruck und Impulskontrolle.',
    ],
    riskFactors: [
      'Mehrstuendiges Nachlegen',
      'Hohe Alkoholmengen',
      'Herz-Kreislauf-Vorerkrankungen oder Brustschmerz',
    ],
    saferUseNotes: [
      'Kombination vermeiden; besonders kein Nachlegen unter Alkoholeinfluss.',
      'Bei Herzsymptomen nicht abwarten.',
      'Nicht allein bleiben und keine weiteren Stimulanzien nehmen.',
    ],
    redFlags: [
      'Brustschmerz, Atemnot, Ohnmacht oder neurologische Ausfaelle.',
      'Starke Unruhe, Ueberhitzung oder anhaltendes Herzrasen.',
    ],
    evidence: 'strong',
    evidenceNote: 'Lokale kuratierte MVP-Bewertung; Cocaethylen ist als Risiko gut beschrieben.',
    sourceNote: 'Evidence/source placeholder: toxikologische Literatur zu Cocaethylen wird verknuepft.',
  },
  {
    id: makeKey('ketamin', 'alkohol'),
    substanceA: 'ketamin',
    substanceB: 'alkohol',
    title: 'Ketamin + Alkohol',
    riskLevel: 'critical',
    severity: 'dangerous',
    summary:
      'Beide Substanzen beeintraechtigen Koordination, Bewusstsein und Schutzreflexe; Erbrechen und Aspiration werden riskanter.',
    mechanisms: [
      'Additive ZNS-Daempfung und motorische Beeintraechtigung.',
      'Ketamin-Dissoziation erschwert Einschaetzung von Alkoholintoxikation.',
      'Erhoehtes Risiko fuer Stuerze, Erbrechen und Aspiration.',
    ],
    riskFactors: [
      'Liegen auf dem Ruecken oder Alleinsein',
      'Hohe Dosen oder Blackout',
      'Weitere Downer wie Benzodiazepine oder Opioide',
    ],
    saferUseNotes: [
      'Kombination vermeiden; nicht nachdosieren, wenn Alkohol im Spiel ist.',
      'Bei Uebelkeit Seitenlage und Beobachtung sicherstellen.',
      'Sichere Umgebung ohne Sturzgefahr.',
    ],
    redFlags: [
      'Bewusstlosigkeit, langsame Atmung oder nicht weckbar.',
      'Erbrechen bei starker Sedierung oder blaeuliche Lippen.',
    ],
    evidence: 'moderate',
    evidenceNote: 'Lokale kuratierte MVP-Bewertung; Quellenkuratierung folgt.',
    sourceNote: 'Evidence/source placeholder: Notfallmedizinische Downer-/Aspiration-Risiken.',
  },
  {
    id: makeKey('cannabis', 'lsd'),
    substanceA: 'cannabis',
    substanceB: 'lsd',
    title: 'Cannabis + LSD',
    riskLevel: 'high',
    severity: 'risky',
    summary:
      'Cannabis kann LSD-Wirkungen stark und unvorhersehbar intensivieren, besonders Angst, Verwirrung und Gedankenschleifen.',
    mechanisms: [
      'THC kann sensorische und kognitive Trip-Intensitaet verstaerken.',
      'Cannabis-induzierte Angst oder Paranoia kann unter LSD eskalieren.',
      'Zeitpunkt ist wichtig: Konsum waehrend Peak ist oft riskanter.',
    ],
    riskFactors: [
      'Hoher THC-Gehalt',
      'Unerfahrenheit mit Psychedelika',
      'Unsicheres Setting oder bestehende Angst',
    ],
    saferUseNotes: [
      'Cannabis waehrend LSD-Peak vermeiden.',
      'Wenn ueberfordert: Reize reduzieren, ruhige Begleitung, keine weiteren Substanzen.',
      'Niedrig dosieren und Wirkung abwarten.',
    ],
    redFlags: [
      'Anhaltende Panik, Realitaetsverlust oder Selbst-/Fremdgefaehrdung.',
      'Verwirrtheit, die nicht durch Ruhe und Begleitung besser wird.',
    ],
    evidence: 'limited',
    evidenceNote: 'Lokale kuratierte MVP-Bewertung; Datenlage begrenzt.',
    sourceNote: 'Evidence/source placeholder: Erfahrungsberichte plus pharmakologische Plausibilitaet.',
  },
  {
    id: makeKey('mdma', 'kokain'),
    substanceA: 'mdma',
    substanceB: 'kokain',
    title: 'MDMA + Kokain',
    riskLevel: 'critical',
    severity: 'dangerous',
    summary:
      'Beide Substanzen stimulieren stark und koennen Herz-Kreislauf-Belastung, Ueberhitzung und Nachdosierungsdruck erhoehen.',
    mechanisms: [
      'Additive sympathomimetische Effekte auf Puls, Blutdruck und Temperatur.',
      'Kokain kann subjektiv MDMA ueberdecken und Nachlegen beguenstigen.',
      'Serotonerge und dopaminerge Belastung koennen Unruhe und Toxizitaet verstaerken.',
    ],
    riskFactors: [
      'Club/Festival-Hitze und Tanzen',
      'Hohe Dosen oder wiederholtes Nachlegen',
      'Herzprobleme, Panik oder Schlafentzug',
    ],
    saferUseNotes: [
      'Kombination vermeiden; keine weiteren Stimulanzien nachlegen.',
      'Kuehlen, pausieren, Wasser/Elekrolyte angemessen nutzen.',
      'Bei Herzsymptomen sofort Hilfe holen.',
    ],
    redFlags: [
      'Brustschmerz, starker Kopfschmerz, Krampf, Kollaps.',
      'Ueberhitzung, Verwirrtheit oder anhaltendes Herzrasen.',
    ],
    evidence: 'moderate',
    evidenceNote: 'Lokale kuratierte MVP-Bewertung; vollstaendige Quellenpruefung folgt.',
    sourceNote: 'Evidence/source placeholder: Stimulanzien-Toxizitaet und Notaufnahme-Kontext.',
  },
  {
    id: makeKey('kratom', 'diazepam'),
    substanceA: 'kratom',
    substanceB: 'diazepam',
    title: 'Kratom + Diazepam',
    riskLevel: 'critical',
    severity: 'dangerous',
    summary:
      'Opioidartige Effekte von Kratom plus Benzodiazepin-Sedierung koennen Atem- und Bewusstseinsrisiken erhoehen.',
    mechanisms: [
      'Additive ZNS-Daempfung durch opioidartige und GABAerge Wirkung.',
      'Sedierung kann Warnzeichen fuer Ueberdosierung verschleiern.',
      'Toleranz und Produktstaerke sind schwer einschaetzbar.',
    ],
    riskFactors: [
      'Weitere Downer wie Alkohol, Phenibut oder Opioide',
      'Hohe Kratom-Extrakte oder unbekannte Potenz',
      'Alleinsein, Schlafen kurz nach Einnahme',
    ],
    saferUseNotes: [
      'Kombination vermeiden, besonders mit weiteren Downern.',
      'Nicht allein bleiben; Atem- und Bewusstseinslage beobachten.',
      'Bei opioidartigem Konsum Naloxon-Verfuegbarkeit erwaegen.',
    ],
    redFlags: [
      'Langsame/ungewoehnliche Atmung, nicht weckbar, blaeuliche Lippen.',
      'Starke Verwirrtheit, wiederholtes Erbrechen oder Kollaps.',
    ],
    evidence: 'limited',
    evidenceNote: 'Lokale kuratierte MVP-Bewertung; spezifische Datenlage begrenzt.',
    sourceNote: 'Evidence/source placeholder: Downer-Kombination, opioidartige Sedierung, Benzodiazepine.',
  },
  {
    id: makeKey('odsmt', 'diazepam'),
    substanceA: 'odsmt',
    substanceB: 'diazepam',
    title: 'O-DSMT + Diazepam',
    riskLevel: 'critical',
    severity: 'dangerous',
    summary:
      'Opioid plus Benzodiazepin ist eine Hochrisiko-Kombination wegen additiver Sedierung und Atemdepression.',
    mechanisms: [
      'O-DSMT kann Atemantrieb reduzieren; Diazepam verstaerkt ZNS-Daempfung.',
      'Bewusstseinsverlust und Erbrechen werden gefaehrlicher.',
      'Lange Diazepam-Wirkdauer verlaengert das Risikofenster.',
    ],
    riskFactors: [
      'Opioidnaivitaet oder hohe Dosen',
      'Alkohol oder weitere Downer',
      'Alleinsein oder Einschlafen ohne Beobachtung',
    ],
    saferUseNotes: [
      'Kombination vermeiden; keine weiteren Downer.',
      'Naloxon und eine informierte Person koennen lebenswichtig sein.',
      'Dosen nicht nachlegen, wenn Sedierung einsetzt.',
    ],
    redFlags: [
      'Langsame Atmung, Schnarchen/Gurgeln, nicht weckbar.',
      'Blaeuliche Lippen, Kollaps oder starke Verwirrtheit.',
    ],
    evidence: 'strong',
    evidenceNote: 'Lokale kuratierte MVP-Bewertung; Opioid+Benzodiazepin-Risiko ist gut etabliert.',
    sourceNote: 'Evidence/source placeholder: klinische Warnungen zu Opioid-Benzodiazepin-Kombinationen.',
  },
  {
    id: makeKey('phenibut', 'alkohol'),
    substanceA: 'phenibut',
    substanceB: 'alkohol',
    title: 'Phenibut + Alkohol',
    riskLevel: 'critical',
    severity: 'dangerous',
    summary:
      'Beide wirken daempfend; die Kombination kann Blackouts, Kontrollverlust, Erbrechen und Atem-/Bewusstseinsrisiken verstaerken.',
    mechanisms: [
      'Additive GABAerge/ZNS-daempfende Effekte.',
      'Phenibut hat langsamen Onset; Alkohol kann zu fruehem Nachlegen verleiten.',
      'Lange Wirk- und Nachwirkzeit erhoeht Blackout- und Unfallrisiko.',
    ],
    riskFactors: [
      'Phenibut-Nachdosierung vor vollem Wirkungseintritt',
      'Hohe Alkoholmengen',
      'Weitere Sedativa oder Alleinsein',
    ],
    saferUseNotes: [
      'Kombination vermeiden; Phenibut-Onset abwarten und nicht nachlegen.',
      'Keine Fahrzeuge, Hoehen, Wasser oder riskante Umgebungen.',
      'Bei starker Sedierung Beobachtung sicherstellen.',
    ],
    redFlags: [
      'Nicht weckbar, langsame Atmung, wiederholtes Erbrechen.',
      'Schwere Verwirrtheit, Sturzverletzung oder Blackout mit Kontrollverlust.',
    ],
    evidence: 'limited',
    evidenceNote: 'Lokale kuratierte MVP-Bewertung; spezifische Studienlage begrenzt.',
    sourceNote: 'Evidence/source placeholder: GABAerge Downer-Kombination und Harm-Reduction-Konsens.',
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
