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
  { label: 'MDMA + SSRI/SNRI', slugs: ['mdma', 'ssri'] },
  { label: 'MDMA + Alkohol', slugs: ['mdma', 'alkohol'] },
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
      'Die Kombination kann euphorische und psychedelische Effekte deutlich verstärken und die psychische sowie körperliche Belastung erhöhen.',
    mechanisms: [
      'Serotonerge Stimulation durch MDMA plus psychedelische 5-HT2A-Aktivität.',
      'Additive Belastung für Herzfrequenz, Blutdruck und Temperaturregulation.',
      'Längere LSD-Wirkdauer kann MDMA-Comedown und Verwirrung verstärken.',
    ],
    riskFactors: [
      'Unklare Menge oder wiederholtes Nachlegen',
      'Warmes, reizintensives Setting',
      'Angst, Panik oder instabile psychische Lage',
    ],
    saferUseNotes: [
      'Keine zusätzliche Einnahme, wenn Wirkung oder Belastung unklar ist.',
      'Kühlpausen, Elektrolyte und ruhiges Setting einplanen.',
      'Eine nüchterne Vertrauensperson kann Eskalationen früh erkennen.',
    ],
    redFlags: [
      'Verwirrtheit, Überhitzung, Kollaps oder Krampfanfall.',
      'Brustschmerz, Atemnot oder anhaltende Panik mit Kontrollverlust.',
    ],
    evidence: 'moderate',
    evidenceNote: 'Lokale kuratierte Bewertung; Quellen werden transparent erweitert.',
    sourceNote: 'Pharmakologische Plausibilitaet und etablierter Harm-Reduction-Kontext.',
  },
  {
    id: makeKey('mdma', 'ssri'),
    substanceA: 'mdma',
    substanceB: 'ssri',
    title: 'MDMA + SSRI/SNRI',
    riskLevel: 'critical',
    severity: 'dangerous',
    summary:
      'SSRI/SNRI können MDMA-Wirkung abschwächen oder unvorhersehbar machen; serotonerge Belastung und riskantes Nachlegen bleiben zentrale Risiken.',
    mechanisms: [
      'SSRI/SNRI verändern Serotonintransporter-Signalwege, an denen MDMA wesentlich ansetzt.',
      'Abgeschwächte subjektive Wirkung kann zu gefährlichem Nachlegen verleiten.',
      'Serotonerge Mehrfachbelastung kann Unruhe, Überhitzung, Verwirrtheit und Serotonin-Toxizität begünstigen.',
    ],
    riskFactors: [
      'Unklare MDMA-Menge oder wiederholtes Nachlegen',
      'Weitere serotonerge Medikamente oder MAO-Hemmer',
      'Hitze, Tanzen, Schlafmangel oder bestehende Kreislaufbelastung',
    ],
    saferUseNotes: [
      'Nicht nachlegen, nur weil MDMA subjektiv schwächer wirkt.',
      'Medikamente nicht eigenmaechtig pausieren oder absetzen, um MDMA stärker zu spüren.',
      'Bei serotonergen Symptomen früh Hilfe holen und keine weiteren Stimulanzien nehmen.',
    ],
    redFlags: [
      'Verwirrtheit, starke Unruhe, Fieber/Überhitzung, Muskelzucken oder Krampf.',
      'Brustschmerz, Kollaps, Atemnot oder sehr schneller/unregelmäßiger Puls.',
    ],
    evidence: 'moderate',
    evidenceNote: 'Lokale kuratierte Bewertung; SSRI/SNRI können Wirkung und Risiko von MDMA relevant verändern.',
    sourceNote: 'Pharmakologie des Serotonintransporters plus klinische Warnsignale serotonerger Toxizität.',
  },
  {
    id: makeKey('mdma', 'alkohol'),
    substanceA: 'mdma',
    substanceB: 'alkohol',
    title: 'MDMA + Alkohol',
    riskLevel: 'high',
    severity: 'risky',
    summary:
      'Alkohol kann Urteilsvermögen, Flüssigkeitshaushalt und Kreislauf unter MDMA verschlechtern und riskantes Nachlegen wahrscheinlicher machen.',
    mechanisms: [
      'Alkohol enthemmt und erschwert das Einschaetzen von Körpersignalen und Grenzen.',
      'MDMA-Stimulation plus Alkoholbelastung kann Puls, Temperaturregulation und Dehydrierung verschlechtern.',
      'Alkohol kann Übelkeit, Erbrechen, Stürze und Blackouts in einem stimulierten Setting riskanter machen.',
    ],
    riskFactors: [
      'Viel Alkohol vor oder während MDMA',
      'Tanzen, Hitze, wenig Pausen oder wenig Schlaf',
      'Weitere Stimulanzien oder wiederholtes Nachlegen',
    ],
    saferUseNotes: [
      'Kombination meiden oder Alkohol klar begrenzen; keine Trinkspiele oder Nachlegen unter Alkoholeinfluss.',
      'Kühlpausen machen und kleine Mengen Wasser/Elektrolyte über Zeit nutzen.',
      'Nicht allein bleiben, wenn Übelkeit, Verwirrung oder Kreislaufprobleme auftreten.',
    ],
    redFlags: [
      'Überhitzung, Verwirrtheit, Kollaps, Krampf oder nicht mehr ansprechbar.',
      'Brustschmerz, Atemnot, wiederholtes Erbrechen oder starke Dehydrierungszeichen.',
    ],
    evidence: 'moderate',
    evidenceNote: 'Lokale kuratierte Bewertung; Mischkonsumrisiko ist pharmakologisch plausibel und harm-reduction-relevant.',
    sourceNote: 'MDMA-Stimulation, Alkoholintoxikation, Temperatur- und Kreislaufbelastung.',
  },
  {
    id: makeKey('kokain', 'alkohol'),
    substanceA: 'kokain',
    substanceB: 'alkohol',
    title: 'Kokain + Alkohol',
    riskLevel: 'critical',
    severity: 'dangerous',
    summary:
      'Diese Kombination bildet Cocaethylen und erhöht Herz-Kreislauf-, Leber- und Risikoverhaltensbelastung deutlich.',
    mechanisms: [
      'In der Leber entsteht Cocaethylen, ein toxischer und länger wirksamer Metabolit.',
      'Alkohol maskiert Kokain-Intoxikation und Kokain maskiert Alkohol-Sedierung.',
      'Additive Belastung für Herz, Blutdruck und Impulskontrolle.',
    ],
    riskFactors: [
      'Mehrstündiges Nachlegen',
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
      'Starke Unruhe, Überhitzung oder anhaltendes Herzrasen.',
    ],
    evidence: 'strong',
    evidenceNote: 'Lokale kuratierte Bewertung; Cocaethylen ist als Risiko gut beschrieben.',
    sourceNote: 'Toxikologische Literatur zu Cocaethylen wird für die mobile Ansicht kuratiert.',
  },
  {
    id: makeKey('ketamin', 'alkohol'),
    substanceA: 'ketamin',
    substanceB: 'alkohol',
    title: 'Ketamin + Alkohol',
    riskLevel: 'critical',
    severity: 'dangerous',
    summary:
      'Beide Substanzen beeinträchtigen Koordination, Bewusstsein und Schutzreflexe; Erbrechen und Aspiration werden riskanter.',
    mechanisms: [
      'Additive ZNS-Dämpfung und motorische Beeintraechtigung.',
      'Ketamin-Dissoziation erschwert Einschätzung von Alkoholintoxikation.',
      'Erhöhtes Risiko für Stürze, Erbrechen und Aspiration.',
    ],
    riskFactors: [
      'Liegen auf dem Ruecken oder Alleinsein',
      'Unklare Menge oder Blackout',
      'Weitere Downer wie Benzodiazepine oder Opioide',
    ],
    saferUseNotes: [
      'Kombination vermeiden; keine weitere Einnahme, wenn Alkohol im Spiel ist.',
      'Bei Übelkeit Seitenlage und Beobachtung sicherstellen.',
      'Sturzrisiken und gefährliche Umgebungen vermeiden.',
    ],
    redFlags: [
      'Bewusstlosigkeit, langsame Atmung oder nicht weckbar.',
      'Erbrechen bei starker Sedierung oder blaeuliche Lippen.',
    ],
    evidence: 'moderate',
    evidenceNote: 'Lokale kuratierte Bewertung; Quellen werden transparent erweitert.',
    sourceNote: 'Notfallmedizinische Downer- und Aspirationsrisiken.',
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
      'THC kann sensorische und kognitive Trip-Intensität verstärken.',
      'Cannabis-induzierte Angst oder Paranoia kann unter LSD eskalieren.',
      'Zeitpunkt ist wichtig: Konsum während Peak ist oft riskanter.',
    ],
    riskFactors: [
      'Hoher THC-Gehalt',
      'Unerfahrenheit mit Psychedelika',
      'Belastendes Setting oder bestehende Angst',
    ],
    saferUseNotes: [
      'Cannabis während LSD-Peak vermeiden.',
      'Wenn überfordert: Reize reduzieren, ruhige Begleitung, keine weiteren Substanzen.',
      'Keine weitere Einnahme, wenn Intensität oder Orientierung unklar sind.',
    ],
    redFlags: [
      'Anhaltende Panik, Realitätsverlust oder Selbst-/Fremdgefährdung.',
      'Verwirrtheit, die nicht durch Ruhe und Begleitung besser wird.',
    ],
    evidence: 'limited',
    evidenceNote: 'Lokale kuratierte Bewertung; Datenlage begrenzt.',
    sourceNote: 'Erfahrungsberichte und pharmakologische Plausibilitaet werden konservativ eingeordnet.',
  },
  {
    id: makeKey('mdma', 'kokain'),
    substanceA: 'mdma',
    substanceB: 'kokain',
    title: 'MDMA + Kokain',
    riskLevel: 'critical',
    severity: 'dangerous',
    summary:
      'Beide Substanzen stimulieren stark und können Herz-Kreislauf-Belastung, Überhitzung und wiederholte Einnahmeimpulse erhöhen.',
    mechanisms: [
      'Additive sympathomimetische Effekte auf Puls, Blutdruck und Temperatur.',
      'Kokain kann subjektiv MDMA überdecken und Nachlegen begünstigen.',
      'Serotonerge und dopaminerge Belastung können Unruhe und Toxizität verstärken.',
    ],
    riskFactors: [
      'Club/Festival-Hitze und Tanzen',
      'Unklare Menge oder wiederholtes Nachlegen',
      'Herzprobleme, Panik oder Schlafentzug',
    ],
    saferUseNotes: [
      'Kombination vermeiden; keine weiteren Stimulanzien nachlegen.',
      'Kühlen, pausieren, Wasser/Elekrolyte angemessen nutzen.',
      'Bei Herzsymptomen sofort Hilfe holen.',
    ],
    redFlags: [
      'Brustschmerz, starker Kopfschmerz, Krampf, Kollaps.',
      'Überhitzung, Verwirrtheit oder anhaltendes Herzrasen.',
    ],
    evidence: 'moderate',
    evidenceNote: 'Lokale kuratierte Bewertung; Quellen werden transparent erweitert.',
    sourceNote: 'Stimulanzien-Toxizität und Notaufnahme-Kontext.',
  },
  {
    id: makeKey('kratom', 'diazepam'),
    substanceA: 'kratom',
    substanceB: 'diazepam',
    title: 'Kratom + Diazepam',
    riskLevel: 'critical',
    severity: 'dangerous',
    summary:
      'Opioidartige Effekte von Kratom plus Benzodiazepin-Sedierung können Atem- und Bewusstseinsrisiken erhöhen.',
    mechanisms: [
      'Additive ZNS-Dämpfung durch opioidartige und GABAerge Wirkung.',
      'Sedierung kann Warnzeichen für akute Atem- oder Bewusstseinsprobleme verschleiern.',
      'Toleranz und Produktstärke sind schwer einschätzbar.',
    ],
    riskFactors: [
      'Weitere Downer wie Alkohol, Phenibut oder Opioide',
      'Hohe Kratom-Extrakte oder unbekannte Potenz',
      'Alleinsein, Schlafen kurz nach Einnahme',
    ],
    saferUseNotes: [
      'Kombination vermeiden, besonders mit weiteren Downern.',
      'Nicht allein bleiben; Atem- und Bewusstseinslage beobachten.',
      'Bei opioidartigem Konsum Naloxon-Verfügbarkeit erwaegen.',
    ],
    redFlags: [
      'Langsame/ungewoehnliche Atmung, nicht weckbar, blaeuliche Lippen.',
      'Starke Verwirrtheit, wiederholtes Erbrechen oder Kollaps.',
    ],
    evidence: 'limited',
    evidenceNote: 'Lokale kuratierte Bewertung; spezifische Datenlage begrenzt.',
    sourceNote: 'Downer-Kombination, opioidartige Sedierung und Benzodiazepin-Kontext.',
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
      'O-DSMT kann Atemantrieb reduzieren; Diazepam verstaerkt ZNS-Dämpfung.',
      'Bewusstseinsverlust und Erbrechen werden gefährlicher.',
      'Lange Diazepam-Wirkdauer verlängert das Risikofenster.',
    ],
    riskFactors: [
      'Opioidnaivitaet oder unklare Menge',
      'Alkohol oder weitere Downer',
      'Alleinsein oder Einschlafen ohne Beobachtung',
    ],
    saferUseNotes: [
      'Kombination vermeiden; keine weiteren Downer.',
      'Naloxon und eine informierte Person können lebenswichtig sein.',
      'Keine weitere Einnahme, wenn Sedierung einsetzt.',
    ],
    redFlags: [
      'Langsame Atmung, Schnarchen/Gurgeln, nicht weckbar.',
      'Blaeuliche Lippen, Kollaps oder starke Verwirrtheit.',
    ],
    evidence: 'strong',
    evidenceNote: 'Lokale kuratierte Bewertung; Opioid+Benzodiazepin-Risiko ist gut etabliert.',
    sourceNote: 'Klinische Warnungen zu Opioid-Benzodiazepin-Kombinationen.',
  },
  {
    id: makeKey('phenibut', 'alkohol'),
    substanceA: 'phenibut',
    substanceB: 'alkohol',
    title: 'Phenibut + Alkohol',
    riskLevel: 'critical',
    severity: 'dangerous',
    summary:
      'Beide wirken dämpfend; die Kombination kann Blackouts, Kontrollverlust, Erbrechen und Atem-/Bewusstseinsrisiken verstärken.',
    mechanisms: [
      'Additive GABAerge/ZNS-dämpfende Effekte.',
      'Phenibut hat langsamen Onset; Alkohol kann zu frühem Nachlegen verleiten.',
      'Lange Wirk- und Nachwirkzeit erhöht Blackout- und Unfallrisiko.',
    ],
    riskFactors: [
      'Weitere Einnahme vor vollem Wirkungseintritt',
      'Hohe Alkoholmengen',
      'Weitere Sedativa oder Alleinsein',
    ],
    saferUseNotes: [
      'Kombination vermeiden; Phenibut-Onset abwarten und nicht nachlegen.',
      'Keine Fahrzeuge, Höhen, Wasser oder riskante Umgebungen.',
      'Bei starker Sedierung Beobachtung sicherstellen.',
    ],
    redFlags: [
      'Nicht weckbar, langsame Atmung, wiederholtes Erbrechen.',
      'Schwere Verwirrtheit, Sturzverletzung oder Blackout mit Kontrollverlust.',
    ],
    evidence: 'limited',
    evidenceNote: 'Lokale kuratierte Bewertung; spezifische Studienlage begrenzt.',
    sourceNote: 'GABAerge Downer-Kombination und etablierter Harm-Reduction-Kontext.',
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
