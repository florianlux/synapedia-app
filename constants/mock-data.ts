import type { RiskLevel, Substance } from '@/types/substance';

type RiskEntry = {
  name: string;
  severity?: RiskLevel;
  description: string;
};

type SaferUseEntry = {
  title: string;
  description: string;
};

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
  acuteRisks: RiskEntry[];
  longtermRisks: RiskEntry[];
  saferUse: SaferUseEntry[];
  warnings: string[];
  mechanisms: string[];
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

function makeRisk(entry: RiskEntry, fallbackSeverity: RiskLevel): Substance['risks']['acute'][number] {
  return {
    name: entry.name,
    severity: entry.severity ?? fallbackSeverity,
    description: entry.description,
  };
}

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
        { label: 'Eintritt', value: seed.quickFacts.onset },
        { label: 'Peak', value: seed.quickFacts.peak },
        { label: 'Dauer', value: seed.quickFacts.duration },
        { label: 'Nachklang', value: seed.quickFacts.afterEffects },
      ],
      total: seed.quickFacts.duration,
    },
    effects: seed.effects,
    risks: {
      acute: seed.acuteRisks.map((risk) => makeRisk(risk, seed.riskLevel === 'unknown' ? 'moderate' : seed.riskLevel)),
      longterm: seed.longtermRisks.map((risk) => makeRisk(risk, seed.riskLevel === 'low' ? 'moderate' : seed.riskLevel)),
    },
    saferUse: seed.saferUse,
    warnings: seed.warnings,
    mechanisms: seed.mechanisms,
    interactions: seed.interactions,
    interactionsPreview: seed.interactions,
    sources: [evidencePlaceholder],
    evidenceNote: 'Lokaler Harm-Reduction-Datensatz. Inhalte sind kompakt kuratiert und ersetzen keine medizinische Beratung.',
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
    summary:
      'MDMA ist ein empathogenes Stimulans mit deutlichem Serotoninbezug. Wirkung und Risiko haengen stark von Setting, Temperatur, Aktivitaet, Schlaf, Nachlegen und Mischkonsum ab.',
    riskLevel: 'moderate',
    riskChips: ['Serotonin', 'Ueberhitzung', 'Mischkonsum'],
    quickFacts: { onset: '30-60 min', peak: '1-2 h', duration: '3-5 h', afterEffects: '1-3 Tage' },
    effects: {
      positive: ['Empathie und soziale Offenheit', 'Euphorie und emotionale Naehe', 'Musik- und Sinnesintensivierung'],
      neutral: ['Stimulation, Wachheit und Bewegungsdrang', 'Kieferspannung, Schwitzen, erhoehter Puls', 'Weniger Schlaf- und Appetitgefuehl'],
      negative: ['Unruhe, Angst oder Verwirrung', 'Ueberhitzung und Kreislaufbelastung', 'Stimmungstief oder Erschoepfung im Nachklang'],
    },
    acuteRisks: [
      { name: 'Ueberhitzung', severity: 'high', description: 'Tanzen, Hitze, enge Raeume und Stimulanzien koennen die Temperaturbelastung deutlich erhoehen.' },
      { name: 'Dehydrierung oder Ueberwaesserung', severity: 'high', description: 'Zu wenig Fluessigkeit ist riskant, aber sehr viel Wasser ohne Elektrolyte kann ebenfalls gefaehrlich werden.' },
      { name: 'Serotonerge Belastung', severity: 'high', description: 'Kombinationen mit serotonergen Medikamenten oder Substanzen koennen unvorhersehbar und riskant sein.' },
      { name: 'Riskantes Nachlegen', severity: 'moderate', description: 'Impulsives Redosing kann Koerperbelastung, Schlafverlust und Comedown verstaerken.' },
    ],
    longtermRisks: [
      { name: 'Nachklang und Stimmung', severity: 'moderate', description: 'Schlafmangel, Erschoepfung und Stimmungstiefs koennen nach dem Konsum auftreten.' },
      { name: 'Haeufiger Konsum', severity: 'moderate', description: 'Kurze Pausen zwischen Sessions koennen Erholung, Schlaf und psychische Stabilitaet belasten.' },
    ],
    saferUse: [
      { title: 'Gefaehrliche Kombinationen meiden', description: 'Besonders MAO-Hemmer, starke Stimulanzien, serotonerge Medikamente und viel Alkohol sind kritisch.' },
      { title: 'Kuehl bleiben', description: 'Pausen, frische Luft und ein weniger heisses Setting reduzieren Temperatur- und Kreislaufstress.' },
      { title: 'Ausgewogen trinken', description: 'Regelmaessig kleine Mengen trinken; nicht aus Angst literweise Wasser erzwingen.' },
      { title: 'Nachdosieren bremsen', description: 'Vorher klare Grenzen setzen, weil Euphorie und Gruppendruck impulsives Nachlegen beguenstigen.' },
      { title: 'Red Flags ernst nehmen', description: 'Verwirrtheit, Kollaps, Krampf, starke Ueberhitzung, Brustschmerz oder Atemnot sind Gruende fuer sofortige Hilfe.' },
    ],
    warnings: [
      'Fehlende oder ausbleibende Wirkung ist kein Signal zum schnellen Nachlegen.',
      'Medikamente wie Antidepressiva koennen Wirkung und Risiko veraendern.',
      'Bei Ueberhitzung, Verwirrtheit oder Krampf nicht abwarten.',
    ],
    mechanisms: [
      'Erhoeht vor allem Serotonin-Signalwege, auch Dopamin und Noradrenalin sind beteiligt.',
      'Stimulation kann Puls, Blutdruck und Temperaturregulation belasten.',
      'Serotonerge Mischungen koennen die koerperliche und psychische Belastung erhoehen.',
    ],
    interactions: [
      { substance: 'SSRI/SNRI', severity: 'dangerous', description: 'Kann Wirkung abschwaechen oder unvorhersehbar machen; serotonerge Risiken bleiben relevant.' },
      { substance: 'Alkohol', severity: 'risky', description: 'Erhoeht Fehlentscheidungen, Dehydrierung und Kreislaufbelastung.' },
      { substance: 'Kokain', severity: 'dangerous', description: 'Additive Stimulation mit hoeherem Herz-Kreislauf- und Ueberhitzungsrisiko.' },
      { substance: 'LSD', severity: 'risky', description: 'Kann Euphorie und psychedelische Intensitaet deutlich verstaerken.' },
    ],
  },
  {
    slug: 'lsd',
    name: 'LSD',
    aliases: ['Acid', 'Lucy', 'Pappen'],
    chemicalName: 'Lysergsaeurediethylamid',
    primaryClass: 'Psychedelikum',
    categories: ['Psychedelikum', 'Halluzinogen'],
    summary:
      'LSD ist ein lang wirkendes Psychedelikum. Set, Setting, Dosisunsicherheit und die lange Dauer praegen Wirkung und Risiko besonders stark.',
    riskLevel: 'moderate',
    riskChips: ['Set & Setting', 'Panik', 'Lange Dauer'],
    quickFacts: { onset: '20-60 min', peak: '2-4 h', duration: '8-12 h', afterEffects: '12-48 h' },
    effects: {
      positive: ['Intensivierte Wahrnehmung', 'Staunen, Einsicht und Verbundenheit', 'Musik- und Musterintensivierung'],
      neutral: ['Zeitverzerrung', 'Grosse Pupillen und koerperliche Unruhe', 'Gedankenschleifen und hohe Reizoffenheit'],
      negative: ['Angst oder Panik', 'Verwirrung und Kontrollverlustgefuehl', 'Ueberforderung bei unsicherem Setting'],
    },
    acuteRisks: [
      { name: 'Panikreaktionen', severity: 'moderate', description: 'Angst kann sich durch Reize, Unsicherheit oder Cannabis deutlich verstaerken.' },
      { name: 'Unfaelle', severity: 'moderate', description: 'Wahrnehmung und Urteilsvermoegen koennen riskante Situationen schwer einschaetzbar machen.' },
      { name: 'Psychische Krise', severity: 'high', description: 'Bei akuter Krise, Psychoseanfaelligkeit oder fehlender Begleitung kann die Belastung eskalieren.' },
    ],
    longtermRisks: [
      { name: 'Nachbelastung', severity: 'moderate', description: 'Verunsicherung, Schlafprobleme oder anhaltende Beschaeftigung mit dem Erlebnis koennen auftreten.' },
      { name: 'Vulnerabilitaet', severity: 'high', description: 'Bestehende psychische Instabilitaet kann durch starke psychedelische Erfahrungen verschlechtert werden.' },
    ],
    saferUse: [
      { title: 'Sicheres Setting', description: 'Ruhiger Ort, vertraute Menschen und keine Verpflichtungen am selben Tag reduzieren Stress.' },
      { title: 'Begleitung einplanen', description: 'Eine nuechterne, vertraute Person kann bei Angst, Orientierung und Eskalation helfen.' },
      { title: 'Mischkonsum vermeiden', description: 'Cannabis, Stimulanzien und Alkohol koennen Intensitaet oder Kontrollverlust verstaerken.' },
      { title: 'Zeitfenster respektieren', description: 'Die lange Dauer braucht Schlaf-, Heimweg- und Ruheplanung.' },
    ],
    warnings: [
      'Nicht in akuten Krisen oder instabilen Situationen verwenden.',
      'Cannabis kann einen Trip ploetzlich stark intensivieren.',
      'Anhaltende Panik oder Selbst-/Fremdgefaehrdung braucht Hilfe.',
    ],
    mechanisms: [
      'Wirkt vor allem ueber serotonerge 5-HT2A-Rezeptorsysteme.',
      'Erhoeht sensorische und kognitive Reizverarbeitung.',
      'Die lange Wirkdauer macht spaete Eskalationen moeglich.',
    ],
    interactions: [
      { substance: 'Cannabis', severity: 'risky', description: 'Kann Trip, Angst und Gedankenschleifen stark intensivieren.' },
      { substance: 'Lithium', severity: 'dangerous', description: 'Berichte ueber schwere Reaktionen; Kombination vermeiden.' },
      { substance: 'MDMA', severity: 'risky', description: 'Mehr Euphorie, aber auch mehr Temperatur-, Schlaf- und psychische Belastung.' },
    ],
  },
  {
    slug: 'ketamin',
    name: 'Ketamin',
    aliases: ['K', 'Special K', 'Ket'],
    chemicalName: 'Ketamin',
    primaryClass: 'Dissoziativum',
    categories: ['Dissoziativum', 'Anaesthetikum'],
    summary:
      'Ketamin ist ein Dissoziativum mit starker Wirkung auf Koordination, Orientierung und Koerperwahrnehmung. Unfall- und Mischkonsumrisiken stehen im Vordergrund.',
    riskLevel: 'moderate',
    riskChips: ['Dissoziation', 'Sturzrisiko', 'Blase'],
    quickFacts: { onset: '5-20 min', peak: '20-60 min', duration: '45-120 min', afterEffects: '2-6 h' },
    effects: {
      positive: ['Koerperliche Entkopplung', 'Traumartige Innenwelten', 'Schmerzdaempfung'],
      neutral: ['Koordinationsstoerung', 'Taubheitsgefuehl', 'Veraenderte Raumwahrnehmung'],
      negative: ['Orientierungsverlust', 'Uebelkeit oder Erbrechen', 'Angst im K-Hole'],
    },
    acuteRisks: [
      { name: 'Stuerze und Unfaelle', severity: 'moderate', description: 'Bewegung, Treppen, Wasser oder Verkehr sind unter Dissoziation besonders riskant.' },
      { name: 'Erbrechen und Aspiration', severity: 'high', description: 'Sedierung und Erbrechen koennen gefaehrlich werden, besonders mit Alkohol oder Downern.' },
      { name: 'Orientierungsverlust', severity: 'moderate', description: 'Starke Dissoziation kann Kommunikation und Selbstschutz erschweren.' },
    ],
    longtermRisks: [
      { name: 'Blasenbeschwerden', severity: 'high', description: 'Haeufiger Konsum wird mit Harnwegs- und Blasenproblemen in Verbindung gebracht.' },
      { name: 'Toleranz und Muster', severity: 'moderate', description: 'Regelmaessige Nutzung kann Toleranz, Craving und Alltagseinfluss foerdern.' },
    ],
    saferUse: [
      { title: 'Sitzendes Setting', description: 'Sturzrisiken reduzieren: sichere Umgebung, keine Hoehen, kein Wasser, kein Verkehr.' },
      { title: 'Downer vermeiden', description: 'Alkohol, Benzodiazepine und Opioide erhoehen Sedierung, Erbrechen und Atemrisiken.' },
      { title: 'Nicht allein bleiben', description: 'Begleitung kann bei Orientierung, Seitenlage und Hilfeholen wichtig sein.' },
      { title: 'Koerpersignale beachten', description: 'Blasenbeschwerden, Schmerzen oder Blut im Urin ernst nehmen und medizinisch abklaeren lassen.' },
    ],
    warnings: [
      'Ketamin plus Alkohol ist besonders unfall- und aspirationsriskant.',
      'Nicht in Situationen konsumieren, in denen Bewegung oder Orientierung noetig sind.',
      'Bewusstlosigkeit oder langsame Atmung sind Notfallsignale.',
    ],
    mechanisms: [
      'Wirkt dissoziativ unter anderem ueber NMDA-Rezeptor-Antagonismus.',
      'Beeintraechtigt Koordination, Wahrnehmung und Schutzreflexe.',
      'Sedierende Mischungen koennen Bewusstsein und Atmung zusaetzlich daempfen.',
    ],
    interactions: [
      { substance: 'Alkohol', severity: 'dangerous', description: 'Mehr Sedierung, Erbrechen, Stuerze und Aspirationsrisiko.' },
      { substance: 'Benzodiazepine', severity: 'risky', description: 'Verstaerkt Sedierung, Amnesie und Orientierungslosigkeit.' },
      { substance: 'Opioide', severity: 'dangerous', description: 'Additive Daempfung kann Atem- und Bewusstseinsrisiken erhoehen.' },
    ],
  },
  {
    slug: 'kokain',
    name: 'Kokain',
    aliases: ['Cocaine', 'Koks', 'Coke'],
    chemicalName: 'Benzoylecgoninmethylester',
    primaryClass: 'Stimulans',
    categories: ['Stimulans'],
    summary:
      'Kokain ist ein kurz wirkendes Stimulans mit hoher Herz-Kreislauf-Belastung, starkem Nachlegeimpuls und besonderer Mischkonsumrelevanz mit Alkohol.',
    riskLevel: 'high',
    riskChips: ['Herz-Kreislauf', 'Craving', 'Alkohol'],
    quickFacts: { onset: '1-10 min', peak: '15-30 min', duration: '30-90 min', afterEffects: '1-24 h' },
    effects: {
      positive: ['Wachheit und Energie', 'Selbstvertrauen', 'Rededrang und Fokus'],
      neutral: ['Appetitminderung', 'Erhoehter Puls und Blutdruck', 'Kurze Wirkdauer mit Nachlegeimpuls'],
      negative: ['Angst, Reizbarkeit oder Paranoia', 'Brustschmerz oder Herzrasen', 'Crash und Erschoepfung'],
    },
    acuteRisks: [
      { name: 'Herz-Kreislauf-Belastung', severity: 'high', description: 'Puls, Blutdruck und Gefaessverengung koennen Brustschmerz, Rhythmusprobleme oder Notfaelle beguenstigen.' },
      { name: 'Nachdosierungsdruck', severity: 'high', description: 'Kurze Wirkung und Craving koennen lange Sessions und mehr Gesamtbelastung foerdern.' },
      { name: 'Ueberhitzung und Unruhe', severity: 'moderate', description: 'Aktivitaet, Hitze und andere Stimulanzien erhoehen koerperlichen Stress.' },
    ],
    longtermRisks: [
      { name: 'Abhaengigkeitsmuster', severity: 'high', description: 'Craving, Kontrollverlust und haeufige Sessions koennen sich schnell verfestigen.' },
      { name: 'Nasale und kardiovaskulaere Schaeden', severity: 'high', description: 'Regelmaessiger Konsum kann Schleimhaeute, Herz und Gefaesse belasten.' },
    ],
    saferUse: [
      { title: 'Alkohol meiden', description: 'Die Kombination kann riskantere Herz-Kreislauf- und Leberbelastung erzeugen.' },
      { title: 'Grenzen vorher setzen', description: 'Zeit-, Geld- und Mengenlimits helfen gegen impulsives Nachlegen.' },
      { title: 'Koerperliche Warnzeichen ernst nehmen', description: 'Brustschmerz, Atemnot, neurologische Ausfaelle oder Kollaps brauchen sofort Hilfe.' },
      { title: 'Keine Stimulanzien stapeln', description: 'MDMA, Amphetamine oder viel Koffein koennen Belastung und Ueberhitzung erhoehen.' },
    ],
    warnings: [
      'Kokain plus Alkohol ist wegen Cocaethylen und maskierter Intoxikation besonders riskant.',
      'Brustschmerz oder Ohnmacht nicht aussitzen.',
      'Schlafmangel und Nachlegen erhoehen psychische Eskalation.',
    ],
    mechanisms: [
      'Blockiert Wiederaufnahme von Dopamin, Noradrenalin und Serotonin.',
      'Sympathische Aktivierung erhoeht Puls, Blutdruck und Temperaturstress.',
      'Alkohol kann die Einschaetzung von Intoxikation verschieben und Cocaethylen-Bildung beguenstigen.',
    ],
    interactions: [
      { substance: 'Alkohol', severity: 'dangerous', description: 'Cocaethylen und maskierte Wirkung erhoehen Herz-, Leber- und Risikoverhalten.' },
      { substance: 'MDMA', severity: 'dangerous', description: 'Additive Stimulation, Ueberhitzung und Nachlegeimpulse.' },
      { substance: 'Amphetamine', severity: 'risky', description: 'Mehr Blutdruck-, Puls- und Angstbelastung.' },
    ],
  },
  {
    slug: 'cannabis',
    name: 'Cannabis',
    aliases: ['THC', 'Weed', 'Gras'],
    chemicalName: 'Cannabinoid-Gemisch',
    primaryClass: 'Cannabinoid',
    categories: ['Cannabinoid'],
    summary:
      'Cannabis wirkt je nach THC/CBD-Verhaeltnis, Route, Toleranz und psychischer Lage sehr unterschiedlich. Angst, Koordination und psychische Vulnerabilitaet sind zentrale Risikothemen.',
    riskLevel: 'moderate',
    riskChips: ['Angst', 'Psychose-Trigger', 'Koordination'],
    quickFacts: { onset: '1-90 min', peak: '30-180 min', duration: '2-8 h', afterEffects: 'bis 24 h' },
    effects: {
      positive: ['Entspannung', 'Appetitsteigerung', 'Sinnesintensivierung'],
      neutral: ['Trockener Mund und rote Augen', 'Zeitverzerrung', 'Langsamere Reaktion'],
      negative: ['Angst oder Paranoia', 'Gedaechtnis- und Konzentrationsprobleme', 'Uebelkeit oder Schwindel'],
    },
    acuteRisks: [
      { name: 'Panik und Paranoia', severity: 'moderate', description: 'Hoher THC-Gehalt, Edibles und unsicheres Setting koennen Angst verstaerken.' },
      { name: 'Unfallrisiko', severity: 'moderate', description: 'Reaktion, Koordination und Aufmerksamkeit koennen beeintraechtigt sein.' },
      { name: 'Psychische Symptome', severity: 'high', description: 'Bei Vulnerabilitaet koennen psychotische oder starke Angst-Symptome getriggert werden.' },
    ],
    longtermRisks: [
      { name: 'Abhaengigkeitsmuster', severity: 'moderate', description: 'Regelmaessiger Konsum kann Craving, Gewohnheit und Entzugssymptome foerdern.' },
      { name: 'Alltags- und Stimmungseinfluss', severity: 'moderate', description: 'Schlaf, Motivation, Konzentration und Stimmung koennen bei haeufiger Nutzung leiden.' },
    ],
    saferUse: [
      { title: 'Langsam angehen', description: 'Besonders bei Edibles und unbekannter Potenz lange genug abwarten.' },
      { title: 'Nicht fahren', description: 'Koordination und Reaktion koennen auch bei subjektivem Wohlgefuehl eingeschraenkt sein.' },
      { title: 'Bei Angst Reize senken', description: 'Ruhiger Ort, Wasser, vertraute Person und keine weiteren Substanzen koennen helfen.' },
      { title: 'Psychische Lage beachten', description: 'Bei akuter Krise, Psychoseanfaelligkeit oder starker Angst vorsichtig sein.' },
    ],
    warnings: [
      'Edibles koennen deutlich spaeter einsetzen und laenger wirken.',
      'Cannabis kann Psychedelika unvorhersehbar verstaerken.',
      'Anhaltende Verwirrtheit oder Realitaetsverlust braucht Hilfe.',
    ],
    mechanisms: [
      'THC wirkt an Cannabinoid-Rezeptoren und beeinflusst Wahrnehmung, Gedaechtnis und Angstverarbeitung.',
      'CBD-Anteil, Route und Toleranz veraendern das Profil deutlich.',
      'Kombination mit Alkohol kann Schwindel, Uebelkeit und Kontrollverlust verstaerken.',
    ],
    interactions: [
      { substance: 'LSD', severity: 'risky', description: 'Kann psychedelische Intensitaet, Angst und Gedankenschleifen verstaerken.' },
      { substance: 'Alkohol', severity: 'risky', description: 'Mehr Uebelkeit, Schwindel, Blackout- und Unfallrisiko.' },
      { substance: 'Stimulanzien', severity: 'caution', description: 'Kann Herzrasen, Angst oder Paranoia verstaerken.' },
    ],
  },
  {
    slug: 'kratom',
    name: 'Kratom',
    aliases: ['Mitragyna speciosa', 'Mitragynin'],
    chemicalName: 'Mitragynin / 7-Hydroxymitragynin',
    primaryClass: 'Opioid-artig',
    categories: ['Opioid-artig', 'Pflanzlich'],
    summary:
      'Kratom ist eine pflanzliche Substanz mit opioidartigen Effekten. Abhaengigkeit, Entzug, Produktstaerke und Downer-Mischkonsum sind die wichtigsten Risikofelder.',
    riskLevel: 'high',
    riskChips: ['Abhaengigkeit', 'Entzug', 'Sedierung'],
    quickFacts: { onset: '20-60 min', peak: '1-2 h', duration: '3-6 h', afterEffects: '6-24 h' },
    effects: {
      positive: ['Schmerzlinderung', 'Entspannung', 'Stimmungshebung'],
      neutral: ['Schwitzen und Juckreiz', 'Uebelkeit', 'Sedierung oder Aktivierung je nach Kontext'],
      negative: ['Erbrechen', 'Abhaengigkeit und Entzug', 'Atemrisiko bei Downer-Mischkonsum'],
    },
    acuteRisks: [
      { name: 'Uebelkeit und Erbrechen', severity: 'moderate', description: 'Produktstaerke und individuelle Empfindlichkeit sind schwer vorhersehbar.' },
      { name: 'Sedierung', severity: 'moderate', description: 'Benommenheit kann Sturz-, Fahr- und Unfallrisiken erhoehen.' },
      { name: 'Downer-Mischkonsum', severity: 'high', description: 'Alkohol, Benzodiazepine und Opioide koennen Atem- und Bewusstseinsrisiken verstaerken.' },
    ],
    longtermRisks: [
      { name: 'Toleranz und Abhaengigkeit', severity: 'high', description: 'Regelmaessige Nutzung kann Dosissteigerung, Craving und Entzug beguenstigen.' },
      { name: 'Entzug', severity: 'high', description: 'Unruhe, Schlafprobleme, Schmerzen, Durchfall und Craving koennen auftreten.' },
    ],
    saferUse: [
      { title: 'Downer nicht kombinieren', description: 'Alkohol, Benzodiazepine, Phenibut und Opioide sind besonders riskant.' },
      { title: 'Regelmaessigkeit beobachten', description: 'Tageskonsum, Craving oder Entzugssymptome sind Warnzeichen fuer ein Muster.' },
      { title: 'Nicht allein bei Sedierung', description: 'Bei starker Benommenheit sollte eine informierte Person erreichbar sein.' },
      { title: 'Entzug ernst nehmen', description: 'Bei schwerem Entzug, Krise oder Mischkonsum medizinische Hilfe suchen.' },
    ],
    warnings: [
      'Produktstaerke und Zusammensetzung koennen stark schwanken.',
      'Kratom plus Benzodiazepine, Alkohol oder Opioide ist besonders riskant.',
      'Entzug kann koerperlich und psychisch belastend sein.',
    ],
    mechanisms: [
      'Mitragynin und verwandte Alkaloide wirken unter anderem an opioidbezogenen Systemen.',
      'Sedierung und Uebelkeit koennen dosis- und produktabhaengig variieren.',
      'Downer-Mischungen koennen Schutzreflexe und Atmung zusaetzlich belasten.',
    ],
    interactions: [
      { substance: 'Diazepam/Benzodiazepine', severity: 'dangerous', description: 'Additive Sedierung und erhoehtes Atemrisiko.' },
      { substance: 'Alkohol', severity: 'dangerous', description: 'Mehr Sedierung, Erbrechen und Kontrollverlust.' },
      { substance: 'Opioide', severity: 'dangerous', description: 'Ueberlappende opioidartige Risiken und Atemdepression.' },
    ],
  },
  {
    slug: 'odsmt',
    name: 'O-DSMT',
    aliases: ['O-Desmethyltramadol', 'ODSMT'],
    chemicalName: 'O-Desmethyltramadol',
    primaryClass: 'Opioid',
    categories: ['Opioid'],
    summary:
      'O-DSMT ist ein opioider Tramadol-Metabolit. Hauptthemen sind Sedierung, Atemdepression, Toleranz, Entzug und Hochrisiko-Kombinationen mit anderen Downern.',
    riskLevel: 'high',
    riskChips: ['Atemdepression', 'Toleranz', 'Entzug'],
    quickFacts: { onset: '30-90 min', peak: '2-4 h', duration: '4-8 h', afterEffects: '8-24 h' },
    effects: {
      positive: ['Schmerzlinderung', 'Waerme und Ruhe', 'Entspannung'],
      neutral: ['Juckreiz und Miosis', 'Verstopfung', 'Schlaefrigkeit'],
      negative: ['Uebelkeit oder Erbrechen', 'Atemdepression', 'Abhaengigkeit und Entzug'],
    },
    acuteRisks: [
      { name: 'Atemdepression', severity: 'high', description: 'Opioide koennen Atmung und Bewusstsein gefaehrlich daempfen, besonders mit Downern.' },
      { name: 'Bewusstseinsverlust', severity: 'high', description: 'Starke Sedierung, Erbrechen und Alleinsein erhoehen Notfallrisiken.' },
      { name: 'Ueberdosierung', severity: 'high', description: 'Toleranz, unbekannte Potenz und Nachlegen koennen das Risiko verschieben.' },
    ],
    longtermRisks: [
      { name: 'Toleranz und Abhaengigkeit', severity: 'high', description: 'Regelmaessige Nutzung kann schnelle Gewoehnung und Entzug foerdern.' },
      { name: 'Entzug', severity: 'high', description: 'Schmerzen, Schlaflosigkeit, Durchfall, Unruhe und Craving koennen stark belasten.' },
    ],
    saferUse: [
      { title: 'Keine Downer-Kombinationen', description: 'Benzodiazepine, Alkohol, Phenibut und andere Opioide erhoehen Atemrisiken deutlich.' },
      { title: 'Naloxon-Zugang pruefen', description: 'Bei opioidartigem Konsum kann Naloxon im Umfeld lebensrettend sein.' },
      { title: 'Nicht allein bei Sedierung', description: 'Eine informierte Person kann Atmung, Bewusstsein und Notfallsignale beobachten.' },
      { title: 'Red Flags kennen', description: 'Langsame Atmung, nicht weckbar, blaue Lippen oder Gurgeln sind Notfallsignale.' },
    ],
    warnings: [
      'Opioide plus Benzodiazepine oder Alkohol koennen lebensbedrohlich sein.',
      'Toleranz sinkt nach Pausen; alte Mengen koennen gefaehrlicher werden.',
      'Nicht weckbare Personen brauchen sofort Hilfe.',
    ],
    mechanisms: [
      'Wirkt opioidartig und kann den Atemantrieb reduzieren.',
      'Sedierung, Uebelkeit und Verstopfung passen zum Opioidprofil.',
      'CNS-Downer verstaerken Bewusstseins- und Atemdaempfung.',
    ],
    interactions: [
      { substance: 'Diazepam/Benzodiazepine', severity: 'dangerous', description: 'Hochrisiko-Kombination wegen additiver Atemdepression.' },
      { substance: 'Alkohol', severity: 'dangerous', description: 'Mehr Sedierung, Erbrechen und Atemrisiko.' },
      { substance: 'Phenibut', severity: 'dangerous', description: 'Additive Daempfung und schwierige Einschaetzung der Sedierung.' },
    ],
  },
  {
    slug: 'phenibut',
    name: 'Phenibut',
    aliases: ['Beta-phenyl-GABA', 'Phen'],
    chemicalName: 'beta-Phenyl-gamma-aminobuttersaeure',
    primaryClass: 'GABAerg',
    categories: ['GABAerg', 'Anxiolytisch'],
    summary:
      'Phenibut ist eine GABAerge Substanz mit langsamem Eintritt, langer Wirkung und relevantem Risiko fuer Toleranz, Abhaengigkeit, Entzug und Downer-Mischkonsum.',
    riskLevel: 'high',
    riskChips: ['Toleranz', 'Entzug', 'Sedierung'],
    quickFacts: { onset: '2-4 h', peak: '4-6 h', duration: '12-24 h', afterEffects: '24-48 h' },
    effects: {
      positive: ['Angstloesung', 'Entspannung', 'Soziale Offenheit'],
      neutral: ['Langsamer Wirkungseintritt', 'Schlaefrigkeit', 'Schwindel und motorische Daempfung'],
      negative: ['Blackouts bei Mischkonsum', 'Rebound-Angst', 'Schwerer Entzug bei regelmaessiger Nutzung'],
    },
    acuteRisks: [
      { name: 'Nachdosieren vor Wirkungseintritt', severity: 'high', description: 'Der langsame Onset kann dazu verleiten, zu frueh nachzulegen.' },
      { name: 'Sedierung und Blackouts', severity: 'high', description: 'Alkohol, Benzodiazepine oder Opioide koennen Daempfung stark verstaerken.' },
      { name: 'Unfallrisiko', severity: 'moderate', description: 'Schwindel, Enthemmung und Koordinationsprobleme koennen riskante Situationen beguenstigen.' },
    ],
    longtermRisks: [
      { name: 'Toleranz', severity: 'high', description: 'Wiederholte Nutzung kann schnell zu Wirkverlust und Steigerungsdruck fuehren.' },
      { name: 'Entzug', severity: 'high', description: 'Rebound-Angst, Schlaflosigkeit, Unruhe und schwere psychische Symptome sind moeglich.' },
    ],
    saferUse: [
      { title: 'Nicht taeglich verwenden', description: 'Regelmaessigkeit ist ein zentrales Warnzeichen fuer Toleranz und Entzug.' },
      { title: 'Onset respektieren', description: 'Langsamen Eintritt einplanen und nicht aus Ungeduld nachlegen.' },
      { title: 'Downer meiden', description: 'Alkohol, Benzodiazepine, Opioide und GHB/GBL koennen Sedierung stark erhoehen.' },
      { title: 'Entzug nicht allein managen', description: 'Bei schwerem Entzug, Panik, Verwirrtheit oder Suizidgedanken Hilfe holen.' },
    ],
    warnings: [
      'Phenibut-Entzug kann stark belastend sein.',
      'Alkohol und Benzodiazepine koennen Blackouts und Sedierung verstaerken.',
      'Langsamer Onset macht impulsives Nachlegen besonders riskant.',
    ],
    mechanisms: [
      'GABAerge Wirkung, vor allem mit GABAB-Bezug.',
      'Lange Wirkdauer und Nachwirkung koennen Risikofenster verlaengern.',
      'Toleranz und Entzug koennen sich bei regelmaessiger Nutzung schnell entwickeln.',
    ],
    interactions: [
      { substance: 'Alkohol', severity: 'dangerous', description: 'Additive Sedierung, Blackouts und Kontrollverlust.' },
      { substance: 'Diazepam/Benzodiazepine', severity: 'dangerous', description: 'Starke Daempfung und schwer einschaetzbare Sedierung.' },
      { substance: 'Opioide', severity: 'dangerous', description: 'Mehr Bewusstseins- und Atemrisiko.' },
    ],
  },
  {
    slug: 'diazepam',
    name: 'Diazepam',
    aliases: ['Valium', 'Benzodiazepin', 'BZD'],
    chemicalName: 'Diazepam',
    primaryClass: 'Benzodiazepin',
    categories: ['Benzodiazepin', 'Sedativum'],
    summary:
      'Diazepam ist ein lang wirkendes Benzodiazepin. Sedierung, Amnesie, Abhaengigkeit, Entzug und Kombinationen mit Alkohol oder Opioiden sind besonders relevant.',
    riskLevel: 'high',
    riskChips: ['Sedierung', 'Abhaengigkeit', 'Entzug'],
    quickFacts: { onset: '15-60 min', peak: '1-2 h', duration: '6-24 h', afterEffects: '1-3 Tage' },
    effects: {
      positive: ['Angstloesung', 'Muskelentspannung', 'Sedierung'],
      neutral: ['Reaktionsverlangsamung', 'Amnesie', 'Koordinationsstoerung'],
      negative: ['Blackouts', 'Atemrisiko bei Mischkonsum', 'Abhaengigkeit und Entzug'],
    },
    acuteRisks: [
      { name: 'Unfaelle und Amnesie', severity: 'high', description: 'Enthemmung, Erinnerungsluecken und Koordinationsstoerung koennen riskantes Verhalten beguenstigen.' },
      { name: 'Atemrisiko bei Mischkonsum', severity: 'high', description: 'Alkohol, Opioide und andere Downer koennen Sedierung und Atemdepression verstaerken.' },
      { name: 'Lange Nachwirkung', severity: 'moderate', description: 'Restwirkung kann Reaktion, Arbeit, Fahren und Entscheidungen am Folgetag beeintraechtigen.' },
    ],
    longtermRisks: [
      { name: 'Abhaengigkeit', severity: 'high', description: 'Regelmaessige Nutzung kann Toleranz, Craving und Kontrollverlust foerdern.' },
      { name: 'Entzug', severity: 'high', description: 'Abruptes Absetzen nach Gewoehnung kann gefaehrlich sein und Krampfrisiken erhoehen.' },
    ],
    saferUse: [
      { title: 'Nicht mit Alkohol oder Opioiden kombinieren', description: 'Diese Kombinationen sind besonders mit Atem- und Bewusstseinsrisiken verbunden.' },
      { title: 'Keine Fahrzeuge', description: 'Reaktion, Koordination und Erinnerung koennen deutlich eingeschraenkt sein.' },
      { title: 'Abhaengigkeitssignale beachten', description: 'Haeufigkeit, Dosissteigerung oder Unruhe ohne Substanz sind Warnzeichen.' },
      { title: 'Entzug medizinisch begleiten', description: 'Nach regelmaessiger Nutzung nicht abrupt absetzen; fachliche Hilfe einplanen.' },
    ],
    warnings: [
      'Benzodiazepine plus Opioide oder Alkohol koennen lebensbedrohlich sein.',
      'Abruptes Absetzen nach Gewoehnung kann gefaehrlich sein.',
      'Amnesie kann riskante Entscheidungen unsichtbar machen.',
    ],
    mechanisms: [
      'Verstaerkt GABAerge Hemmung und daempft Aktivierung im Nervensystem.',
      'Lange Wirkdauer kann Nachwirkungen und Interaktionsfenster verlaengern.',
      'Andere CNS-Downer koennen Sedierung und Atemdepression additiv verstaerken.',
    ],
    interactions: [
      { substance: 'Opioide/O-DSMT', severity: 'dangerous', description: 'Hochrisiko-Kombination wegen Atemdepression und Bewusstseinsverlust.' },
      { substance: 'Alkohol', severity: 'dangerous', description: 'Mehr Blackouts, Enthemmung, Stuerze und Atemrisiko.' },
      { substance: 'Kratom', severity: 'dangerous', description: 'Additive Sedierung und schwer einschaetzbare opioidartige Risiken.' },
    ],
  },
  {
    slug: 'alkohol',
    name: 'Alkohol',
    aliases: ['Ethanol', 'Alcohol', 'EtOH'],
    chemicalName: 'Ethanol',
    primaryClass: 'Depressivum',
    categories: ['Depressivum'],
    summary:
      'Alkohol ist ein legales Depressivum mit hoher Mischkonsum-Relevanz. Enthemmung, Koordination, Blackouts, Abhaengigkeit und Langzeitschaeden sind zentrale Risikothemen.',
    riskLevel: 'high',
    riskChips: ['Mischkonsum', 'Leber', 'Unfaelle'],
    quickFacts: { onset: '5-30 min', peak: '30-90 min', duration: '2-8 h', afterEffects: '8-24 h' },
    effects: {
      positive: ['Enthemmung', 'Entspannung', 'Soziale Lockerung'],
      neutral: ['Langsamere Reaktion', 'Koordinationsstoerung', 'Harndrang und Dehydrierung'],
      negative: ['Uebelkeit und Erbrechen', 'Blackouts', 'Aggression, Risikoentscheidungen oder Atemrisiko bei Downern'],
    },
    acuteRisks: [
      { name: 'Alkoholvergiftung', severity: 'high', description: 'Bewusstlosigkeit, Erbrechen, langsame Atmung oder nicht weckbar sind Notfallsignale.' },
      { name: 'Unfaelle und Gewalt', severity: 'high', description: 'Enthemmung und Koordinationseinbruch erhoehen Verletzungs- und Eskalationsrisiken.' },
      { name: 'Mischkonsum', severity: 'high', description: 'Benzodiazepine, Opioide, Ketamin und GHB/GBL koennen Atem- und Bewusstseinsrisiken stark erhoehen.' },
    ],
    longtermRisks: [
      { name: 'Abhaengigkeit', severity: 'high', description: 'Regelmaessige Nutzung kann Toleranz, Entzug und Kontrollverlust foerdern.' },
      { name: 'Organ- und Nervensystembelastung', severity: 'high', description: 'Leber, Herz, Gehirn und Psyche koennen bei haeufigem oder starkem Konsum belastet werden.' },
    ],
    saferUse: [
      { title: 'Nicht mit Downern kombinieren', description: 'Benzodiazepine, Opioide, Ketamin, Phenibut und GHB/GBL sind besonders riskant.' },
      { title: 'Tempo senken', description: 'Langsames Trinken, Essen und Pausen koennen Kontrollverlust reduzieren.' },
      { title: 'Nicht fahren', description: 'Reaktion und Koordination sind auch bei subjektiver Sicherheit eingeschraenkt.' },
      { title: 'Notfallsignale kennen', description: 'Nicht weckbar, langsame Atmung, blasse/kalte Haut oder Erbrechen im Schlaf brauchen Hilfe.' },
    ],
    warnings: [
      'Alkohol kann die Wirkung anderer Substanzen maskieren oder verstaerken.',
      'Downer-Kombinationen sind besonders gefaehrlich.',
      'Bewusstlose Personen nicht allein lassen.',
    ],
    mechanisms: [
      'Daempft das zentrale Nervensystem und beeintraechtigt Koordination und Urteil.',
      'Kann Schutzreflexe und Atmung in Kombination mit anderen Downern zusaetzlich belasten.',
      'Mit Kokain kann ein laenger wirksamer toxischer Metabolit entstehen.',
    ],
    interactions: [
      { substance: 'Kokain', severity: 'dangerous', description: 'Cocaethylen-Bildung, maskierte Intoxikation und erhoehtes Herzrisiko.' },
      { substance: 'Diazepam/Benzodiazepine', severity: 'dangerous', description: 'Mehr Blackouts, Sedierung und Atemrisiko.' },
      { substance: 'Ketamin', severity: 'dangerous', description: 'Mehr Erbrechen, Stuerze, Aspiration und Orientierungslosigkeit.' },
      { substance: 'MDMA', severity: 'risky', description: 'Mehr Dehydrierung, Fehlentscheidungen und Kreislaufbelastung.' },
    ],
  },
];

export const SUBSTANCES: Substance[] = seeds.map(makeSubstance);

export const SUBSTANCES_MAP: Record<string, Substance> = Object.fromEntries(
  SUBSTANCES.map((substance) => [substance.slug, substance]),
);
