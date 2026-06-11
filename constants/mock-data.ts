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
  title: 'Lokaler kuratierter Datensatz: Quellen werden transparent erweitert.',
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
    evidenceNote: 'Lokaler kuratierter Datensatz. Inhalte sind kompakt zusammengefasst und ersetzen keine professionelle Beratung.',
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
      'MDMA ist ein empathogenes Stimulans mit deutlichem Serotoninbezug. Wirkung und Risiko hängen stark von Setting, Temperatur, Aktivität, Schlaf, Nachlegen und Mischkonsum ab.',
    riskLevel: 'moderate',
    riskChips: ['Serotonin', 'Überhitzung', 'Mischkonsum'],
    quickFacts: { onset: '30-60 min', peak: '1-2 h', duration: '3-5 h', afterEffects: '1-3 Tage' },
    effects: {
      positive: ['Empathie und soziale Offenheit', 'Euphorie und emotionale Nähe', 'Musik- und Sinnesintensivierung'],
      neutral: ['Stimulation, Wachheit und Bewegungsdrang', 'Kieferspannung, Schwitzen, erhöhter Puls', 'Weniger Schlaf- und Appetitgefühl'],
      negative: ['Unruhe, Angst oder Verwirrung', 'Überhitzung und Kreislaufbelastung', 'Stimmungstief oder Erschöpfung im Nachklang'],
    },
    acuteRisks: [
      { name: 'Überhitzung', severity: 'high', description: 'Tanzen, Hitze, enge Räume und Stimulanzien können die Temperaturbelastung deutlich erhöhen.' },
      { name: 'Dehydrierung oder Überwässerung', severity: 'high', description: 'Zu wenig Flüssigkeit ist riskant, aber sehr viel Wasser ohne Elektrolyte kann ebenfalls gefährlich werden.' },
      { name: 'Serotonerge Belastung', severity: 'high', description: 'Kombinationen mit serotonergen Medikamenten oder Substanzen können unvorhersehbar und riskant sein.' },
      { name: 'Riskantes Nachlegen', severity: 'moderate', description: 'Impulsives Redosing kann Körperbelastung, Schlafverlust und Comedown verstärken.' },
    ],
    longtermRisks: [
      { name: 'Nachklang und Stimmung', severity: 'moderate', description: 'Schlafmangel, Erschöpfung und Stimmungstiefs können nach dem Konsum auftreten.' },
      { name: 'Häufiger Konsum', severity: 'moderate', description: 'Kurze Pausen zwischen Sessions können Erholung, Schlaf und psychische Stabilität belasten.' },
    ],
    saferUse: [
      { title: 'Gefährliche Kombinationen meiden', description: 'Besonders MAO-Hemmer, starke Stimulanzien, serotonerge Medikamente und viel Alkohol sind kritisch.' },
      { title: 'Kühl bleiben', description: 'Pausen, frische Luft und ein weniger heißes Setting reduzieren Temperatur- und Kreislaufstress.' },
      { title: 'Ausgewogen trinken', description: 'Regelmäßig kleine Mengen trinken; nicht aus Angst literweise Wasser erzwingen.' },
      { title: 'Impulsives Nachlegen bremsen', description: 'Vorher klare Grenzen setzen, weil Euphorie und Gruppendruck impulsives Nachlegen begünstigen.' },
      { title: 'Red Flags ernst nehmen', description: 'Verwirrtheit, Kollaps, Krampf, starke Überhitzung, Brustschmerz oder Atemnot sind Gründe für sofortige Hilfe.' },
    ],
    warnings: [
      'Fehlende oder ausbleibende Wirkung ist kein Signal zum schnellen Nachlegen.',
      'Medikamente wie Antidepressiva können Wirkung und Risiko verändern.',
      'Bei Überhitzung, Verwirrtheit oder Krampf nicht abwarten.',
    ],
    mechanisms: [
      'Erhöht vor allem Serotonin-Signalwege, auch Dopamin und Noradrenalin sind beteiligt.',
      'Stimulation kann Puls, Blutdruck und Temperaturregulation belasten.',
      'Serotonerge Mischungen können die körperliche und psychische Belastung erhöhen.',
    ],
    interactions: [
      { substance: 'SSRI/SNRI', severity: 'dangerous', description: 'Kann Wirkung abschwächen oder unvorhersehbar machen; serotonerge Risiken bleiben relevant.' },
      { substance: 'Alkohol', severity: 'risky', description: 'Erhöht Fehlentscheidungen, Dehydrierung und Kreislaufbelastung.' },
      { substance: 'Kokain', severity: 'dangerous', description: 'Additive Stimulation mit höherem Herz-Kreislauf- und Überhitzungsrisiko.' },
      { substance: 'LSD', severity: 'risky', description: 'Kann Euphorie und psychedelische Intensität deutlich verstärken.' },
    ],
  },
  {
    slug: 'lsd',
    name: 'LSD',
    aliases: ['Acid', 'Lucy', 'Pappen'],
    chemicalName: 'Lysergsäurediethylamid',
    primaryClass: 'Psychedelikum',
    categories: ['Psychedelikum', 'Halluzinogen'],
    summary:
      'LSD ist ein lang wirkendes Psychedelikum. Set, Setting, unklare Produktstärke und die lange Dauer prägen Wirkung und Risiko besonders stark.',
    riskLevel: 'moderate',
    riskChips: ['Set & Setting', 'Panik', 'Lange Dauer'],
    quickFacts: { onset: '20-60 min', peak: '2-4 h', duration: '8-12 h', afterEffects: '12-48 h' },
    effects: {
      positive: ['Intensivierte Wahrnehmung', 'Staunen, Einsicht und Verbundenheit', 'Musik- und Musterintensivierung'],
      neutral: ['Zeitverzerrung', 'Große Pupillen und körperliche Unruhe', 'Gedankenschleifen und hohe Reizoffenheit'],
      negative: ['Angst oder Panik', 'Verwirrung und Kontrollverlustgefühl', 'Überforderung bei unsicherem Setting'],
    },
    acuteRisks: [
      { name: 'Panikreaktionen', severity: 'moderate', description: 'Angst kann sich durch Reize, Unsicherheit oder Cannabis deutlich verstärken.' },
      { name: 'Unfälle', severity: 'moderate', description: 'Wahrnehmung und Urteilsvermögen können riskante Situationen schwer einschätzbar machen.' },
      { name: 'Psychische Krise', severity: 'high', description: 'Bei akuter Krise, Psychoseanfälligkeit oder fehlender Begleitung kann die Belastung eskalieren.' },
    ],
    longtermRisks: [
      { name: 'Nachbelastung', severity: 'moderate', description: 'Verunsicherung, Schlafprobleme oder anhaltende Beschäftigung mit dem Erlebnis können auftreten.' },
      { name: 'Vulnerabilität', severity: 'high', description: 'Bestehende psychische Instabilität kann durch starke psychedelische Erfahrungen verschlechtert werden.' },
    ],
    saferUse: [
      { title: 'Ruhiges Umfeld', description: 'Ruhiger Ort, vertraute Menschen und keine Verpflichtungen am selben Tag reduzieren Stress.' },
      { title: 'Begleitung einplanen', description: 'Eine nüchterne, vertraute Person kann bei Angst, Orientierung und Eskalation helfen.' },
      { title: 'Mischkonsum vermeiden', description: 'Cannabis, Stimulanzien und Alkohol können Intensität oder Kontrollverlust verstärken.' },
      { title: 'Zeitfenster respektieren', description: 'Die lange Dauer braucht Schlaf-, Heimweg- und Ruheplanung.' },
    ],
    warnings: [
      'Nicht in akuten Krisen oder instabilen Situationen verwenden.',
      'Cannabis kann einen Trip plötzlich stark intensivieren.',
      'Anhaltende Panik oder Selbst-/Fremdgefährdung braucht Hilfe.',
    ],
    mechanisms: [
      'Wirkt vor allem über serotonerge 5-HT2A-Rezeptorsysteme.',
      'Erhöht sensorische und kognitive Reizverarbeitung.',
      'Die lange Wirkdauer macht späte Eskalationen möglich.',
    ],
    interactions: [
      { substance: 'Cannabis', severity: 'risky', description: 'Kann Trip, Angst und Gedankenschleifen stark intensivieren.' },
      { substance: 'Lithium', severity: 'dangerous', description: 'Berichte über schwere Reaktionen; Kombination vermeiden.' },
      { substance: 'MDMA', severity: 'risky', description: 'Mehr Euphorie, aber auch mehr Temperatur-, Schlaf- und psychische Belastung.' },
    ],
  },
  {
    slug: 'ketamin',
    name: 'Ketamin',
    aliases: ['K', 'Special K', 'Ket'],
    chemicalName: 'Ketamin',
    primaryClass: 'Dissoziativum',
    categories: ['Dissoziativum', 'Anästhetikum'],
    summary:
      'Ketamin ist ein Dissoziativum mit starker Wirkung auf Koordination, Orientierung und Körperwahrnehmung. Unfall- und Mischkonsumrisiken stehen im Vordergrund.',
    riskLevel: 'moderate',
    riskChips: ['Dissoziation', 'Sturzrisiko', 'Blase'],
    quickFacts: { onset: '5-20 min', peak: '20-60 min', duration: '45-120 min', afterEffects: '2-6 h' },
    effects: {
      positive: ['Körperliche Entkopplung', 'Traumartige Innenwelten', 'Schmerzdämpfung'],
      neutral: ['Koordinationsstörung', 'Taubheitsgefühl', 'Veraenderte Raumwahrnehmung'],
      negative: ['Orientierungsverlust', 'Übelkeit oder Erbrechen', 'Angst im K-Hole'],
    },
    acuteRisks: [
      { name: 'Stürze und Unfälle', severity: 'moderate', description: 'Bewegung, Treppen, Wasser oder Verkehr sind unter Dissoziation besonders riskant.' },
      { name: 'Erbrechen und Aspiration', severity: 'high', description: 'Sedierung und Erbrechen können gefährlich werden, besonders mit Alkohol oder Downern.' },
      { name: 'Orientierungsverlust', severity: 'moderate', description: 'Starke Dissoziation kann Kommunikation und Selbstschutz erschweren.' },
    ],
    longtermRisks: [
      { name: 'Blasenbeschwerden', severity: 'high', description: 'Häufiger Konsum wird mit Harnwegs- und Blasenproblemen in Verbindung gebracht.' },
      { name: 'Toleranz und Muster', severity: 'moderate', description: 'Regelmäßige Nutzung kann Toleranz, Craving und Alltagseinfluss fördern.' },
    ],
    saferUse: [
      { title: 'Sturzrisiken reduzieren', description: 'Stabile Umgebung, keine Höhen, kein Wasser, kein Verkehr.' },
      { title: 'Downer vermeiden', description: 'Alkohol, Benzodiazepine und Opioide erhöhen Sedierung, Erbrechen und Atemrisiken.' },
      { title: 'Nicht allein bleiben', description: 'Begleitung kann bei Orientierung, Seitenlage und Hilfeholen wichtig sein.' },
      { title: 'Körpersignale beachten', description: 'Blasenbeschwerden, Schmerzen oder Blut im Urin ernst nehmen und medizinisch abklären lassen.' },
    ],
    warnings: [
      'Ketamin plus Alkohol ist besonders unfall- und aspirationsriskant.',
      'Nicht in Situationen konsumieren, in denen Bewegung oder Orientierung nötig sind.',
      'Bewusstlosigkeit oder langsame Atmung sind Notfallsignale.',
    ],
    mechanisms: [
      'Wirkt dissoziativ unter anderem über NMDA-Rezeptor-Antagonismus.',
      'Beeinträchtigt Koordination, Wahrnehmung und Schutzreflexe.',
      'Sedierende Mischungen können Bewusstsein und Atmung zusätzlich dämpfen.',
    ],
    interactions: [
      { substance: 'Alkohol', severity: 'dangerous', description: 'Mehr Sedierung, Erbrechen, Stürze und Aspirationsrisiko.' },
      { substance: 'Benzodiazepine', severity: 'risky', description: 'Verstaerkt Sedierung, Amnesie und Orientierungslosigkeit.' },
      { substance: 'Opioide', severity: 'dangerous', description: 'Additive Dämpfung kann Atem- und Bewusstseinsrisiken erhöhen.' },
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
      neutral: ['Appetitminderung', 'Erhöhter Puls und Blutdruck', 'Kurze Wirkdauer mit Nachlegeimpuls'],
      negative: ['Angst, Reizbarkeit oder Paranoia', 'Brustschmerz oder Herzrasen', 'Crash und Erschöpfung'],
    },
    acuteRisks: [
      { name: 'Herz-Kreislauf-Belastung', severity: 'high', description: 'Puls, Blutdruck und Gefäßverengung können Brustschmerz, Rhythmusprobleme oder Notfälle begünstigen.' },
      { name: 'Wiederholte Einnahmeimpulse', severity: 'high', description: 'Kurze Wirkung und Craving können lange Sessions und mehr Gesamtbelastung fördern.' },
      { name: 'Überhitzung und Unruhe', severity: 'moderate', description: 'Aktivität, Hitze und andere Stimulanzien erhöhen körperlichen Stress.' },
    ],
    longtermRisks: [
      { name: 'Abhängigkeitsmuster', severity: 'high', description: 'Craving, Kontrollverlust und häufige Sessions können sich schnell verfestigen.' },
      { name: 'Nasale und kardiovaskulaere Schäden', severity: 'high', description: 'Regelmäßiger Konsum kann Schleimhaeute, Herz und Gefaesse belasten.' },
    ],
    saferUse: [
      { title: 'Alkohol meiden', description: 'Die Kombination kann riskantere Herz-Kreislauf- und Leberbelastung erzeugen.' },
      { title: 'Grenzen vorher setzen', description: 'Zeit-, Geld- und Mengenlimits helfen gegen impulsives Nachlegen.' },
      { title: 'Körperliche Warnzeichen ernst nehmen', description: 'Brustschmerz, Atemnot, neurologische Ausfaelle oder Kollaps brauchen sofort Hilfe.' },
      { title: 'Keine Stimulanzien stapeln', description: 'MDMA, Amphetamine oder viel Koffein können Belastung und Überhitzung erhöhen.' },
    ],
    warnings: [
      'Kokain plus Alkohol ist wegen Cocaethylen und maskierter Intoxikation besonders riskant.',
      'Brustschmerz oder Ohnmacht nicht aussitzen.',
      'Schlafmangel und Nachlegen erhöhen psychische Eskalation.',
    ],
    mechanisms: [
      'Blockiert Wiederaufnahme von Dopamin, Noradrenalin und Serotonin.',
      'Sympathische Aktivierung erhöht Puls, Blutdruck und Temperaturstress.',
      'Alkohol kann die Einschätzung von Intoxikation verschieben und Cocaethylen-Bildung begünstigen.',
    ],
    interactions: [
      { substance: 'Alkohol', severity: 'dangerous', description: 'Cocaethylen und maskierte Wirkung erhöhen Herz-, Leber- und Risikoverhalten.' },
      { substance: 'MDMA', severity: 'dangerous', description: 'Additive Stimulation, Überhitzung und Nachlegeimpulse.' },
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
      'Cannabis wirkt je nach THC/CBD-Verhältnis, Route, Toleranz und psychischer Lage sehr unterschiedlich. Angst, Koordination und psychische Vulnerabilität sind zentrale Risikothemen.',
    riskLevel: 'moderate',
    riskChips: ['Angst', 'Psychose-Trigger', 'Koordination'],
    quickFacts: { onset: '1-90 min', peak: '30-180 min', duration: '2-8 h', afterEffects: 'bis 24 h' },
    effects: {
      positive: ['Entspannung', 'Appetitsteigerung', 'Sinnesintensivierung'],
      neutral: ['Trockener Mund und rote Augen', 'Zeitverzerrung', 'Langsamere Reaktion'],
      negative: ['Angst oder Paranoia', 'Gedächtnis- und Konzentrationsprobleme', 'Übelkeit oder Schwindel'],
    },
    acuteRisks: [
      { name: 'Panik und Paranoia', severity: 'moderate', description: 'Hoher THC-Gehalt, Edibles und unsicheres Setting können Angst verstärken.' },
      { name: 'Unfallrisiko', severity: 'moderate', description: 'Reaktion, Koordination und Aufmerksamkeit können beeinträchtigt sein.' },
      { name: 'Psychische Symptome', severity: 'high', description: 'Bei Vulnerabilität können psychotische oder starke Angst-Symptome getriggert werden.' },
    ],
    longtermRisks: [
      { name: 'Abhängigkeitsmuster', severity: 'moderate', description: 'Regelmäßiger Konsum kann Craving, Gewohnheit und Entzugssymptome fördern.' },
      { name: 'Alltags- und Stimmungseinfluss', severity: 'moderate', description: 'Schlaf, Motivation, Konzentration und Stimmung können bei häufiger Nutzung leiden.' },
    ],
    saferUse: [
      { title: 'Langsam angehen', description: 'Besonders bei Edibles und unbekannter Potenz lange genug abwarten.' },
      { title: 'Nicht fahren', description: 'Koordination und Reaktion können auch bei subjektivem Wohlgefühl eingeschraenkt sein.' },
      { title: 'Bei Angst Reize senken', description: 'Ruhiger Ort, Wasser, vertraute Person und keine weiteren Substanzen können helfen.' },
      { title: 'Psychische Lage beachten', description: 'Bei akuter Krise, Psychoseanfälligkeit oder starker Angst vorsichtig sein.' },
    ],
    warnings: [
      'Edibles können deutlich später einsetzen und länger wirken.',
      'Cannabis kann Psychedelika unvorhersehbar verstärken.',
      'Anhaltende Verwirrtheit oder Realitätsverlust braucht Hilfe.',
    ],
    mechanisms: [
      'THC wirkt an Cannabinoid-Rezeptoren und beeinflusst Wahrnehmung, Gedächtnis und Angstverarbeitung.',
      'CBD-Anteil, Route und Toleranz verändern das Profil deutlich.',
      'Kombination mit Alkohol kann Schwindel, Übelkeit und Kontrollverlust verstärken.',
    ],
    interactions: [
      { substance: 'LSD', severity: 'risky', description: 'Kann psychedelische Intensität, Angst und Gedankenschleifen verstärken.' },
      { substance: 'Alkohol', severity: 'risky', description: 'Mehr Übelkeit, Schwindel, Blackout- und Unfallrisiko.' },
      { substance: 'Stimulanzien', severity: 'caution', description: 'Kann Herzrasen, Angst oder Paranoia verstärken.' },
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
      'Kratom ist eine pflanzliche Substanz mit opioidartigen Effekten. Abhängigkeit, Entzug, Produktstärke und Downer-Mischkonsum sind die wichtigsten Risikofelder.',
    riskLevel: 'high',
    riskChips: ['Abhängigkeit', 'Entzug', 'Sedierung'],
    quickFacts: { onset: '20-60 min', peak: '1-2 h', duration: '3-6 h', afterEffects: '6-24 h' },
    effects: {
      positive: ['Schmerzlinderung', 'Entspannung', 'Stimmungshebung'],
      neutral: ['Schwitzen und Juckreiz', 'Übelkeit', 'Sedierung oder Aktivierung je nach Kontext'],
      negative: ['Erbrechen', 'Abhängigkeit und Entzug', 'Atemrisiko bei Downer-Mischkonsum'],
    },
    acuteRisks: [
      { name: 'Übelkeit und Erbrechen', severity: 'moderate', description: 'Produktstärke und individuelle Empfindlichkeit sind schwer vorhersehbar.' },
      { name: 'Sedierung', severity: 'moderate', description: 'Benommenheit kann Sturz-, Fahr- und Unfallrisiken erhöhen.' },
      { name: 'Downer-Mischkonsum', severity: 'high', description: 'Alkohol, Benzodiazepine und Opioide können Atem- und Bewusstseinsrisiken verstärken.' },
    ],
    longtermRisks: [
      { name: 'Toleranz und Abhängigkeit', severity: 'high', description: 'Regelmäßige Nutzung kann steigende Mengen, Craving und Entzug begünstigen.' },
      { name: 'Entzug', severity: 'high', description: 'Unruhe, Schlafprobleme, Schmerzen, Durchfall und Craving können auftreten.' },
    ],
    saferUse: [
      { title: 'Downer nicht kombinieren', description: 'Alkohol, Benzodiazepine, Phenibut und Opioide sind besonders riskant.' },
      { title: 'Regelmäßigkeit beobachten', description: 'Tageskonsum, Craving oder Entzugssymptome sind Warnzeichen für ein Muster.' },
      { title: 'Nicht allein bei Sedierung', description: 'Bei starker Benommenheit sollte eine informierte Person erreichbar sein.' },
      { title: 'Entzug ernst nehmen', description: 'Bei schwerem Entzug, Krise oder Mischkonsum medizinische Hilfe suchen.' },
    ],
    warnings: [
      'Produktstärke und Zusammensetzung können stark schwanken.',
      'Kratom plus Benzodiazepine, Alkohol oder Opioide ist besonders riskant.',
      'Entzug kann körperlich und psychisch belastend sein.',
    ],
    mechanisms: [
      'Mitragynin und verwandte Alkaloide wirken unter anderem an opioidbezogenen Systemen.',
      'Sedierung und Übelkeit können personen- und produktabhängig variieren.',
      'Downer-Mischungen können Schutzreflexe und Atmung zusätzlich belasten.',
    ],
    interactions: [
      { substance: 'Diazepam/Benzodiazepine', severity: 'dangerous', description: 'Additive Sedierung und erhöhtes Atemrisiko.' },
      { substance: 'Alkohol', severity: 'dangerous', description: 'Mehr Sedierung, Erbrechen und Kontrollverlust.' },
      { substance: 'Opioide', severity: 'dangerous', description: 'Überlappende opioidartige Risiken und Atemdepression.' },
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
      positive: ['Schmerzlinderung', 'Wärme und Ruhe', 'Entspannung'],
      neutral: ['Juckreiz und Miosis', 'Verstopfung', 'Schläfrigkeit'],
      negative: ['Übelkeit oder Erbrechen', 'Atemdepression', 'Abhängigkeit und Entzug'],
    },
    acuteRisks: [
      { name: 'Atemdepression', severity: 'high', description: 'Opioide können Atmung und Bewusstsein gefährlich dämpfen, besonders mit Downern.' },
      { name: 'Bewusstseinsverlust', severity: 'high', description: 'Starke Sedierung, Erbrechen und Alleinsein erhöhen Notfallrisiken.' },
      { name: 'Schwere Intoxikation', severity: 'high', description: 'Toleranz, unbekannte Potenz und Nachlegen können das Risiko verschieben.' },
    ],
    longtermRisks: [
      { name: 'Toleranz und Abhängigkeit', severity: 'high', description: 'Regelmäßige Nutzung kann schnelle Gewöhnung und Entzug fördern.' },
      { name: 'Entzug', severity: 'high', description: 'Schmerzen, Schlaflosigkeit, Durchfall, Unruhe und Craving können stark belasten.' },
    ],
    saferUse: [
      { title: 'Keine Downer-Kombinationen', description: 'Benzodiazepine, Alkohol, Phenibut und andere Opioide erhöhen Atemrisiken deutlich.' },
      { title: 'Naloxon-Zugang prüfen', description: 'Bei opioidartigem Konsum kann Naloxon im Umfeld lebensrettend sein.' },
      { title: 'Nicht allein bei Sedierung', description: 'Eine informierte Person kann Atmung, Bewusstsein und Notfallsignale beobachten.' },
      { title: 'Red Flags kennen', description: 'Langsame Atmung, nicht weckbar, blaue Lippen oder Gurgeln sind Notfallsignale.' },
    ],
    warnings: [
      'Opioide plus Benzodiazepine oder Alkohol können lebensbedrohlich sein.',
      'Toleranz sinkt nach Pausen; alte Mengen können gefährlicher werden.',
      'Nicht weckbare Personen brauchen sofort Hilfe.',
    ],
    mechanisms: [
      'Wirkt opioidartig und kann den Atemantrieb reduzieren.',
      'Sedierung, Übelkeit und Verstopfung passen zum Opioidprofil.',
      'CNS-Downer verstärken Bewusstseins- und Atemdämpfung.',
    ],
    interactions: [
      { substance: 'Diazepam/Benzodiazepine', severity: 'dangerous', description: 'Hochrisiko-Kombination wegen additiver Atemdepression.' },
      { substance: 'Alkohol', severity: 'dangerous', description: 'Mehr Sedierung, Erbrechen und Atemrisiko.' },
      { substance: 'Phenibut', severity: 'dangerous', description: 'Additive Dämpfung und schwierige Einschätzung der Sedierung.' },
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
      'Phenibut ist eine GABAerge Substanz mit langsamem Eintritt, langer Wirkung und relevantem Risiko für Toleranz, Abhängigkeit, Entzug und Downer-Mischkonsum.',
    riskLevel: 'high',
    riskChips: ['Toleranz', 'Entzug', 'Sedierung'],
    quickFacts: { onset: '2-4 h', peak: '4-6 h', duration: '12-24 h', afterEffects: '24-48 h' },
    effects: {
      positive: ['Angstloesung', 'Entspannung', 'Soziale Offenheit'],
      neutral: ['Langsamer Wirkungseintritt', 'Schläfrigkeit', 'Schwindel und motorische Dämpfung'],
      negative: ['Blackouts bei Mischkonsum', 'Rebound-Angst', 'Schwerer Entzug bei regelmäßiger Nutzung'],
    },
    acuteRisks: [
      { name: 'Weitere Einnahme vor Wirkungseintritt', severity: 'high', description: 'Der langsame Onset kann dazu verleiten, zu früh nachzulegen.' },
      { name: 'Sedierung und Blackouts', severity: 'high', description: 'Alkohol, Benzodiazepine oder Opioide können Dämpfung stark verstärken.' },
      { name: 'Unfallrisiko', severity: 'moderate', description: 'Schwindel, Enthemmung und Koordinationsprobleme können riskante Situationen begünstigen.' },
    ],
    longtermRisks: [
      { name: 'Toleranz', severity: 'high', description: 'Wiederholte Nutzung kann schnell zu Wirkverlust und Steigerungsdruck führen.' },
      { name: 'Entzug', severity: 'high', description: 'Rebound-Angst, Schlaflosigkeit, Unruhe und schwere psychische Symptome sind möglich.' },
    ],
    saferUse: [
      { title: 'Nicht täglich verwenden', description: 'Regelmäßigkeit ist ein zentrales Warnzeichen für Toleranz und Entzug.' },
      { title: 'Onset respektieren', description: 'Langsamen Eintritt einplanen und nicht aus Ungeduld nachlegen.' },
      { title: 'Downer meiden', description: 'Alkohol, Benzodiazepine, Opioide und GHB/GBL können Sedierung stark erhöhen.' },
      { title: 'Entzug nicht allein managen', description: 'Bei schwerem Entzug, Panik, Verwirrtheit oder Suizidgedanken Hilfe holen.' },
    ],
    warnings: [
      'Phenibut-Entzug kann stark belastend sein.',
      'Alkohol und Benzodiazepine können Blackouts und Sedierung verstärken.',
      'Langsamer Onset macht impulsives Nachlegen besonders riskant.',
    ],
    mechanisms: [
      'GABAerge Wirkung, vor allem mit GABAB-Bezug.',
      'Lange Wirkdauer und Nachwirkung können Risikofenster verlängern.',
      'Toleranz und Entzug können sich bei regelmäßiger Nutzung schnell entwickeln.',
    ],
    interactions: [
      { substance: 'Alkohol', severity: 'dangerous', description: 'Additive Sedierung, Blackouts und Kontrollverlust.' },
      { substance: 'Diazepam/Benzodiazepine', severity: 'dangerous', description: 'Starke Dämpfung und schwer einschätzbare Sedierung.' },
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
      'Diazepam ist ein lang wirkendes Benzodiazepin. Sedierung, Amnesie, Abhängigkeit, Entzug und Kombinationen mit Alkohol oder Opioiden sind besonders relevant.',
    riskLevel: 'high',
    riskChips: ['Sedierung', 'Abhängigkeit', 'Entzug'],
    quickFacts: { onset: '15-60 min', peak: '1-2 h', duration: '6-24 h', afterEffects: '1-3 Tage' },
    effects: {
      positive: ['Angstloesung', 'Muskelentspannung', 'Sedierung'],
      neutral: ['Reaktionsverlangsamung', 'Amnesie', 'Koordinationsstörung'],
      negative: ['Blackouts', 'Atemrisiko bei Mischkonsum', 'Abhängigkeit und Entzug'],
    },
    acuteRisks: [
      { name: 'Unfälle und Amnesie', severity: 'high', description: 'Enthemmung, Erinnerungsluecken und Koordinationsstörung können riskantes Verhalten begünstigen.' },
      { name: 'Atemrisiko bei Mischkonsum', severity: 'high', description: 'Alkohol, Opioide und andere Downer können Sedierung und Atemdepression verstärken.' },
      { name: 'Lange Nachwirkung', severity: 'moderate', description: 'Restwirkung kann Reaktion, Arbeit, Fahren und Entscheidungen am Folgetag beeinträchtigen.' },
    ],
    longtermRisks: [
      { name: 'Abhängigkeit', severity: 'high', description: 'Regelmäßige Nutzung kann Toleranz, Craving und Kontrollverlust fördern.' },
      { name: 'Entzug', severity: 'high', description: 'Abruptes Absetzen nach Gewöhnung kann gefährlich sein und Krampfrisiken erhöhen.' },
    ],
    saferUse: [
      { title: 'Nicht mit Alkohol oder Opioiden kombinieren', description: 'Diese Kombinationen sind besonders mit Atem- und Bewusstseinsrisiken verbunden.' },
      { title: 'Keine Fahrzeuge', description: 'Reaktion, Koordination und Erinnerung können deutlich eingeschraenkt sein.' },
      { title: 'Abhängigkeitssignale beachten', description: 'Häufigkeit, steigende Mengen oder Unruhe ohne Substanz sind Warnzeichen.' },
      { title: 'Entzug medizinisch begleiten', description: 'Nach regelmäßiger Nutzung nicht abrupt absetzen; fachliche Hilfe einplanen.' },
    ],
    warnings: [
      'Benzodiazepine plus Opioide oder Alkohol können lebensbedrohlich sein.',
      'Abruptes Absetzen nach Gewöhnung kann gefährlich sein.',
      'Amnesie kann riskante Entscheidungen unsichtbar machen.',
    ],
    mechanisms: [
      'Verstaerkt GABAerge Hemmung und dämpft Aktivierung im Nervensystem.',
      'Lange Wirkdauer kann Nachwirkungen und Interaktionsfenster verlängern.',
      'Andere CNS-Downer können Sedierung und Atemdepression additiv verstärken.',
    ],
    interactions: [
      { substance: 'Opioide/O-DSMT', severity: 'dangerous', description: 'Hochrisiko-Kombination wegen Atemdepression und Bewusstseinsverlust.' },
      { substance: 'Alkohol', severity: 'dangerous', description: 'Mehr Blackouts, Enthemmung, Stürze und Atemrisiko.' },
      { substance: 'Kratom', severity: 'dangerous', description: 'Additive Sedierung und schwer einschätzbare opioidartige Risiken.' },
    ],
  },
  {
    slug: 'ssri',
    name: 'SSRI/SNRI',
    aliases: ['SSRI', 'SNRI', 'Antidepressiva', 'Sertralin', 'Fluoxetin', 'Citalopram', 'Venlafaxin'],
    chemicalName: 'Selektive Serotonin-/Noradrenalin-Wiederaufnahmehemmer',
    primaryClass: 'Medikamentenklasse',
    categories: ['Medikament', 'Serotonerg'],
    summary:
      'SSRI/SNRI sind verschreibungspflichtige Antidepressiva. Für MixCheck sind vor allem serotonerge Interaktionen, Veraenderungen subjektiver MDMA-Wirkung und Absetzrisiken relevant.',
    riskLevel: 'moderate',
    riskChips: ['Serotonin', 'Medikation', 'Interaktionen'],
    quickFacts: { onset: 'Tage-Wochen', peak: 'regelmäßige Einnahme', duration: 'substanzabhängig', afterEffects: 'Absetzen nur ärztlich' },
    effects: {
      positive: ['Stimmungsstabilisierung bei passender Indikation', 'Reduktion von Angst- oder Depressionssymptomen', 'Therapeutische Wirkung bei regelmäßiger Einnahme'],
      neutral: ['Wirkaufbau über Tage bis Wochen', 'Individuelle Unterschiede je Wirkstoff und Person', 'Mögliche Wechselwirkungen über serotonerge Systeme'],
      negative: ['Übelkeit, Schlaf- oder Sexualfunktionsstoerungen', 'Unruhe oder emotionale Abflachung', 'Absetzsymptome bei abruptem Stoppen'],
    },
    acuteRisks: [
      { name: 'Serotonerge Interaktionen', severity: 'high', description: 'Kombinationen mit MDMA, MAO-Hemmern oder weiteren serotonergen Stoffen können unvorhersehbar und gefährlich werden.' },
      { name: 'Maskierte MDMA-Wirkung', severity: 'high', description: 'Abgeschwächte Wirkung kann zu Nachlegen verleiten, obwohl körperliche Belastung weiter relevant bleibt.' },
      { name: 'Eigenmaechtiges Absetzen', severity: 'moderate', description: 'Pausieren oder Absetzen ohne medizinische Begleitung kann Absetzsymptome und Rückfälle begünstigen.' },
    ],
    longtermRisks: [
      { name: 'Absetzsymptome', severity: 'moderate', description: 'Abruptes Stoppen kann Schwindel, Unruhe, Schlafprobleme und Stimmungsschwankungen auslösen.' },
      { name: 'Wechselwirkungen', severity: 'moderate', description: 'Andere Medikamente oder Substanzen können Wirkung, Nebenwirkungen und Risiko verändern.' },
    ],
    saferUse: [
      { title: 'Medikation nicht für Konsum verändern', description: 'SSRI/SNRI nicht eigenmaechtig pausieren, absetzen oder verändern, um Substanzeffekte zu steuern.' },
      { title: 'Serotonerge Mischungen meiden', description: 'MDMA, MAO-Hemmer, bestimmte Medikamente und weitere serotonerge Stoffe können kritisch sein.' },
      { title: 'Warnzeichen ernst nehmen', description: 'Fieber, Verwirrtheit, Muskelzucken, Krampf, starke Unruhe oder Kollaps sind Gründe für sofortige Hilfe.' },
    ],
    warnings: [
      'MDMA-Wirkung kann abgeschwächt sein; Nachlegen bleibt riskant.',
      'Nicht eigenmaechtig absetzen, um Mischkonsum zu ermöglichen.',
      'Serotonerge Warnzeichen sind medizinisch relevant.',
    ],
    mechanisms: [
      'SSRI/SNRI beeinflussen Wiederaufnahme und Verfügbarkeit von Serotonin beziehungsweise Noradrenalin.',
      'MDMA nutzt serotonerge Transporter und kann dadurch in Wirkung und Risiko veraendert werden.',
      'Mehrere serotonerge Einflüsse können Toxizitätszeichen begünstigen.',
    ],
    interactions: [
      { substance: 'MDMA', severity: 'dangerous', description: 'Kann subjektive Wirkung abschwächen oder unvorhersehbar machen; serotonerge Risiken und Nachlegen bleiben kritisch.' },
      { substance: 'MAO-Hemmer', severity: 'lethal', description: 'Potentiell lebensgefährliche serotonerge Interaktion.' },
      { substance: 'Tramadol/O-DSMT', severity: 'dangerous', description: 'Serotonerge und krampfschwellenbezogene Risiken können steigen.' },
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
      'Alkohol ist ein legales Depressivum mit hoher Mischkonsum-Relevanz. Enthemmung, Koordination, Blackouts, Abhängigkeit und Langzeitschäden sind zentrale Risikothemen.',
    riskLevel: 'high',
    riskChips: ['Mischkonsum', 'Leber', 'Unfälle'],
    quickFacts: { onset: '5-30 min', peak: '30-90 min', duration: '2-8 h', afterEffects: '8-24 h' },
    effects: {
      positive: ['Enthemmung', 'Entspannung', 'Soziale Lockerung'],
      neutral: ['Langsamere Reaktion', 'Koordinationsstörung', 'Harndrang und Dehydrierung'],
      negative: ['Übelkeit und Erbrechen', 'Blackouts', 'Aggression, Risikoentscheidungen oder Atemrisiko bei Downern'],
    },
    acuteRisks: [
      { name: 'Alkoholvergiftung', severity: 'high', description: 'Bewusstlosigkeit, Erbrechen, langsame Atmung oder nicht weckbar sind Notfallsignale.' },
      { name: 'Unfälle und Gewalt', severity: 'high', description: 'Enthemmung und Koordinationseinbruch erhöhen Verletzungs- und Eskalationsrisiken.' },
      { name: 'Mischkonsum', severity: 'high', description: 'Benzodiazepine, Opioide, Ketamin und GHB/GBL können Atem- und Bewusstseinsrisiken stark erhöhen.' },
    ],
    longtermRisks: [
      { name: 'Abhängigkeit', severity: 'high', description: 'Regelmäßige Nutzung kann Toleranz, Entzug und Kontrollverlust fördern.' },
      { name: 'Organ- und Nervensystembelastung', severity: 'high', description: 'Leber, Herz, Gehirn und Psyche können bei häufigem oder starkem Konsum belastet werden.' },
    ],
    saferUse: [
      { title: 'Nicht mit Downern kombinieren', description: 'Benzodiazepine, Opioide, Ketamin, Phenibut und GHB/GBL sind besonders riskant.' },
      { title: 'Tempo senken', description: 'Langsames Trinken, Essen und Pausen können Kontrollverlust reduzieren.' },
      { title: 'Nicht fahren', description: 'Reaktion und Koordination können auch bei subjektivem Kontrollgefühl eingeschraenkt sein.' },
      { title: 'Notfallsignale kennen', description: 'Nicht weckbar, langsame Atmung, blasse/kalte Haut oder Erbrechen im Schlaf brauchen Hilfe.' },
    ],
    warnings: [
      'Alkohol kann die Wirkung anderer Substanzen maskieren oder verstärken.',
      'Downer-Kombinationen sind besonders gefährlich.',
      'Bewusstlose Personen nicht allein lassen.',
    ],
    mechanisms: [
      'Daempft das zentrale Nervensystem und beeinträchtigt Koordination und Urteil.',
      'Kann Schutzreflexe und Atmung in Kombination mit anderen Downern zusätzlich belasten.',
      'Mit Kokain kann ein länger wirksamer toxischer Metabolit entstehen.',
    ],
    interactions: [
      { substance: 'Kokain', severity: 'dangerous', description: 'Cocaethylen-Bildung, maskierte Intoxikation und erhöhtes Herzrisiko.' },
      { substance: 'Diazepam/Benzodiazepine', severity: 'dangerous', description: 'Mehr Blackouts, Sedierung und Atemrisiko.' },
      { substance: 'Ketamin', severity: 'dangerous', description: 'Mehr Erbrechen, Stürze, Aspiration und Orientierungslosigkeit.' },
      { substance: 'MDMA', severity: 'risky', description: 'Mehr Dehydrierung, Fehlentscheidungen und Kreislaufbelastung.' },
    ],
  },
];

export const SUBSTANCES: Substance[] = seeds.map(makeSubstance);

export const SUBSTANCES_MAP: Record<string, Substance> = Object.fromEntries(
  SUBSTANCES.map((substance) => [substance.slug, substance]),
);
