import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

import { useThemeColors } from '@/hooks/use-theme';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useSubstance } from '@/hooks/use-substance';
import { useAppContext } from '@/contexts/AppContext';
import { HeroHeader } from '@/components/substance/HeroHeader';
import { QuickFactsStrip } from '@/components/substance/QuickFactsStrip';
import { ExpandableSection } from '@/components/substance/ExpandableSection';
import { DurationSection } from '@/components/substance/DurationSection';
import { InteractionsPreviewSection } from '@/components/substance/InteractionsPreviewSection';
import { StickyBottomBar } from '@/components/substance/StickyBottomBar';
import { RiskProfileBars } from '@/components/visual/RiskProfileBars';
import { DurationTimeline } from '@/components/visual/DurationTimeline';
import { SourceBadge } from '@/components/ui/SourceBadge';
import type { RiskLevel } from '@/types/substance';

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

function goBackToWiki() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace('/(tabs)/wiki');
}

export default function SubstanceDetailScreen() {
  const {
    slug,
    name,
    primaryClass,
    summary,
    duration,
    riskLevel,
    riskLabel,
  } = useLocalSearchParams<{
    slug: string;
    name?: string;
    primaryClass?: string;
    summary?: string;
    duration?: string;
    riskLevel?: string;
    riskLabel?: string;
  }>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite, addRecentlyViewed } = useAppContext();

  const fallbackRiskLevel = normalizeRouteRiskLevel(riskLevel);
  const routeFallback = useMemo(
    () =>
      name
        ? {
            slug,
            name,
            primaryClass,
            summary,
            duration,
            riskLevel: fallbackRiskLevel,
            riskLabel,
          }
        : null,
    [slug, name, primaryClass, summary, duration, fallbackRiskLevel, riskLabel],
  );
  const substanceState = useSubstance(slug, routeFallback);
  const isSaved = slug ? isFavorite(slug) : false;

  useEffect(() => {
    if (slug && substanceState.status === 'success') addRecentlyViewed(slug);
  }, [slug, substanceState.status, addRecentlyViewed]);

  useEffect(() => {
    if (!__DEV__ || substanceState.status !== 'success') return;

    debugSubstanceRender({
      slug,
      source: substanceState.source,
      data: substanceState.data,
    });
  }, [slug, substanceState]);

  // ---- Loading state ----
  if (substanceState.status === 'loading') {
    return (
      <View
        style={[
          styles.screen,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}>
        <DetailSkeleton />
      </View>
    );
  }

  // ---- Error state ----
  if (substanceState.status === 'error') {
    return (
      <View
        style={[
          styles.centeredContainer,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textTertiary} />
        <Text style={[Typography.sectionTitle, styles.errorTitle, { color: colors.textPrimary }]}>
          Detail nicht erreichbar
        </Text>
        <Text
          style={[
            Typography.body,
            { color: colors.textSecondary, marginTop: Spacing.md, textAlign: 'center' },
          ]}>
          {substanceState.notFound ? 'Substanz nicht gefunden' : substanceState.message}
        </Text>
        <Pressable
          onPress={goBackToWiki}
          accessibilityRole="button"
          style={[styles.retryButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Ionicons name="chevron-back" size={18} color={colors.accent} />
          <Text style={[Typography.bodyBold, { color: colors.accent }]}>
            Zurueck zum Wiki
          </Text>
        </Pressable>
      </View>
    );
  }

  const substance = substanceState.data;
  const source = substanceState.source;
  const refreshing = substanceState.refreshing;
  const interactionsPreview = substance.interactionsPreview ?? substance.interactions;
  const hasDuration = hasSubstanceDuration(substance);
  const scrollBottomPadding = insets.bottom + Spacing.screenBottom + 72;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* ── Z1: Nav Bar ── */}
      <View
        style={[
          styles.navBar,
          { paddingTop: insets.top, backgroundColor: colors.backgroundGlass, borderBottomColor: colors.separator },
        ]}>
        <Pressable onPress={goBackToWiki} hitSlop={8} style={styles.navButton}>
          <Ionicons name="chevron-back" size={28} color={colors.accent} />
        </Pressable>
        <Text
          style={[
            Typography.navTitle,
            styles.navTitle,
            { color: colors.textPrimary },
          ]}
          numberOfLines={1}>
          {substance.name}
        </Text>
        <Pressable
          onPress={() => {
            if (slug) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              toggleFavorite(slug);
            }
          }}
          hitSlop={8}
          style={styles.navButton}>
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={24}
            color={isSaved ? colors.riskHigh : colors.textTertiary}
          />
        </Pressable>
      </View>

      {/* ── Z2–Z4: Scrollable Content ── */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
        showsVerticalScrollIndicator={false}>
        {/* Z2: Hero Header */}
        <HeroHeader substance={substance} />

        {/* Z3: Quick Facts */}
        <QuickFactsStrip quickFacts={substance.quickFacts} />

        <RiskProfileBars substance={substance} />
        <DurationTimeline quickFacts={substance.quickFacts} />

        <DisclaimerCard />

        <View style={inlineStyles.sourceRow}>
          <SourceBadge source={source} refreshing={refreshing} />
        </View>

        <DataQualityNote
          source={source}
          evidenceNote={substance.evidenceNote}
          sourceCount={substance.sources.length}
          lastUpdated={substance.lastUpdated}
        />

        {/* Z4: Expandable Sections */}
        <ExpandableSection title="Überblick" initialExpanded>
          <OverviewContent
            summary={substance.summary}
            aliases={substance.aliases}
            primaryClass={substance.primaryClass}
            categories={substance.categories}
            riskLabel={substance.riskLabel}
            mechanisms={substance.mechanisms}
          />
        </ExpandableSection>

        <ExpandableSection title="Wirkdauer">
          {hasDuration ? (
            <DurationSection
              phases={substance.duration.phases}
              total={substance.duration.total}
              quickFacts={substance.quickFacts}
              notes={['Zeitangaben sind Richtwerte und koennen je nach Dosis, Person, Route und Setting variieren.']}
            />
          ) : (
            <DurationFallbackContent />
          )}
        </ExpandableSection>

        <ExpandableSection
          title="Wirkung"
          hidden={
            substance.effects.positive.length === 0 &&
            substance.effects.neutral.length === 0 &&
            substance.effects.negative.length === 0
          }>
          <EffectsContent effects={substance.effects} />
        </ExpandableSection>

        <ExpandableSection
          title="Risiken"
          hidden={
            substance.risks.acute.length === 0 &&
            substance.risks.longterm.length === 0 &&
            substance.warnings.length === 0
          }>
          <RisksContent risks={substance.risks} warnings={substance.warnings} />
        </ExpandableSection>

        <ExpandableSection title="Safer Use" hidden={substance.saferUse.length === 0}>
          <SaferUseContent tips={substance.saferUse} />
        </ExpandableSection>

        <ExpandableSection
          title="Interaktionen"
          badge={interactionsPreview.length}>
          <InteractionsPreviewSection
            interactions={interactionsPreview}
            onOpenMixCheck={() => router.push('/(tabs)/check')}
          />
        </ExpandableSection>

        <ExpandableSection
          title="Evidenz & Quellen"
          hidden={substance.sources.length === 0 && !substance.lastUpdated && !substance.evidenceNote}>
          <SourcesContent
            sources={substance.sources}
            lastUpdated={substance.lastUpdated}
            evidenceNote={substance.evidenceNote}
          />
        </ExpandableSection>

        <HarmReductionBox riskLevel={substance.riskLevel} />
      </ScrollView>

      {/* ── Z5: Sticky Bottom Bar ── */}
      <StickyBottomBar
        onCheckInteraction={() => router.push('/(tabs)/check')}
        onSave={() => {
          if (slug) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toggleFavorite(slug);
          }
        }}
        isSaved={isSaved}
      />
    </View>
  );
}

function DetailSkeleton() {
  const colors = useThemeColors();

  return (
    <View style={styles.skeletonWrap}>
      <View style={[styles.skeletonNav, { backgroundColor: colors.backgroundGlass, borderBottomColor: colors.separator }]}>
        <View style={[styles.skeletonIcon, { backgroundColor: colors.backgroundTertiary }]} />
        <View style={[styles.skeletonLine, styles.skeletonTitleLine, { backgroundColor: colors.backgroundTertiary }]} />
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
      <View style={[styles.skeletonHero, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
        <View style={[styles.skeletonLine, styles.skeletonLargeLine, { backgroundColor: colors.backgroundTertiary }]} />
        <View style={[styles.skeletonLine, styles.skeletonMediumLine, { backgroundColor: colors.backgroundTertiary }]} />
        <View style={styles.skeletonChipRow}>
          {[0, 1, 2].map((item) => (
            <View key={item} style={[styles.skeletonChip, { backgroundColor: colors.backgroundTertiary }]} />
          ))}
        </View>
      </View>
      {[0, 1, 2].map((item) => (
        <View key={item} style={[styles.skeletonCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
          <View style={[styles.skeletonLine, styles.skeletonMediumLine, { backgroundColor: colors.backgroundTertiary }]} />
          <View style={[styles.skeletonLine, styles.skeletonFullLine, { backgroundColor: colors.backgroundTertiary }]} />
        </View>
      ))}
    </View>
  );
}

function normalizeRouteRiskLevel(value: string | undefined): RiskLevel | undefined {
  if (
    value === 'low' ||
    value === 'moderate' ||
    value === 'high' ||
    value === 'extreme' ||
    value === 'unknown'
  ) {
    return value;
  }
  return undefined;
}

function hasUsefulValue(value: string | undefined): boolean {
  return !!value && value !== '-' && value !== '—';
}

function hasSubstanceDuration(substance: {
  duration: { phases: { value: string }[]; total: string };
  quickFacts: { onset: string; peak: string; duration: string; afterEffects: string };
}): boolean {
  return (
    substance.duration.phases.some((phase) => hasUsefulValue(phase.value)) ||
    hasUsefulValue(substance.duration.total) ||
    hasUsefulValue(substance.quickFacts.onset) ||
    hasUsefulValue(substance.quickFacts.peak) ||
    hasUsefulValue(substance.quickFacts.duration) ||
    hasUsefulValue(substance.quickFacts.afterEffects)
  );
}

function debugSubstanceRender({
  slug,
  source,
  data,
}: {
  slug: string | undefined;
  source: string;
  data: {
    summary?: string;
    effects: { positive: string[]; neutral: string[]; negative: string[] };
    risks: { acute: unknown[]; longterm: unknown[] };
    saferUse: unknown[];
    warnings: unknown[];
    mechanisms: unknown[];
    duration: { phases: unknown[]; total?: string };
    interactionsPreview?: unknown[];
    interactions: unknown[];
  };
}) {
  console.debug('[substance-detail]', {
    slug,
    source,
    summaryLength: data.summary?.length ?? 0,
    effectsCount:
      data.effects.positive.length +
      data.effects.neutral.length +
      data.effects.negative.length,
    risksCount: data.risks.acute.length + data.risks.longterm.length,
    saferUseCount: data.saferUse.length,
    warningsCount: data.warnings.length,
    mechanismsCount: data.mechanisms.length,
    durationObjectPresence: {
      hasObject: !!data.duration,
      phasesCount: data.duration.phases.length,
      hasTotal: hasUsefulValue(data.duration.total),
    },
    interactionsPreviewCount: (data.interactionsPreview ?? data.interactions).length,
  });
}

// ---------------------------------------------------------------------------
// Inline section-content components (simple enough to live here for now)
// ---------------------------------------------------------------------------

function DisclaimerCard() {
  const colors = useThemeColors();

  return (
    <View style={[inlineStyles.disclaimerCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
      <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
      <Text style={[Typography.caption, { color: colors.textSecondary, flex: 1 }]}>
        Informations- und Harm-Reduction-Tool. Keine medizinische Beratung.
      </Text>
    </View>
  );
}

function OverviewContent({
  summary,
  aliases,
  primaryClass,
  categories,
  riskLabel,
  mechanisms,
}: {
  summary?: string;
  aliases?: string[];
  primaryClass?: string;
  categories: string[];
  riskLabel: string;
  mechanisms: string[];
}) {
  const colors = useThemeColors();
  const categoryText = categories.length ? categories.join(', ') : 'Keine Klasse angegeben';

  return (
    <View style={{ gap: Spacing.md }}>
      <Text style={[Typography.body, { color: colors.textPrimary }]}>
        {summary || 'Noch keine Zusammenfassung verfuegbar.'}
      </Text>
      <View style={inlineStyles.overviewGrid}>
        <InfoTile label="Klasse" value={primaryClass ?? categories[0] ?? '—'} />
        <InfoTile label="Aliasse" value={aliases?.length ? aliases.join(', ') : '—'} />
        <InfoTile label="Risiko" value={riskLabel} />
      </View>
      <Text style={[Typography.caption, { color: colors.textSecondary }]}>
        Kontext: {categoryText}
      </Text>
      {mechanisms.length > 0 && (
        <View>
          <Text style={[Typography.captionBold, { color: colors.textSecondary, marginBottom: Spacing.sm }]}>
            Mechanismen
          </Text>
          <BulletList items={mechanisms.slice(0, 4)} />
        </View>
      )}
    </View>
  );
}

function DataQualityNote({
  source,
  evidenceNote,
  sourceCount,
  lastUpdated,
}: {
  source: string;
  evidenceNote?: string;
  sourceCount: number;
  lastUpdated: string;
}) {
  const colors = useThemeColors();
  const details = [
    evidenceNote,
    sourceCount > 0 ? `${sourceCount} Quellen erfasst` : undefined,
    lastUpdated ? `Stand ${lastUpdated}` : undefined,
  ].filter((item): item is string => Boolean(item));
  const fallback = source === 'offline'
    ? 'Offline-Fallback: Detaildaten koennen unvollstaendig sein.'
    : 'Datenqualitaet: mobile Vorschau, konservativ interpretieren.';

  return (
    <View style={[inlineStyles.dataQualityNote, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
      <Ionicons name="shield-outline" size={16} color={colors.accent} />
      <Text style={[Typography.caption, inlineStyles.dataQualityText, { color: colors.textSecondary }]}>
        {details.length ? details.join(' · ') : fallback}
      </Text>
    </View>
  );
}

function DurationFallbackContent() {
  const colors = useThemeColors();

  return (
    <View style={[inlineStyles.fallbackBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
      <Ionicons name="time-outline" size={18} color={colors.textTertiary} />
      <Text style={[Typography.caption, inlineStyles.fallbackText, { color: colors.textSecondary }]}>
        Fuer diese Substanz liegen noch keine belastbaren mobilen Zeitangaben vor. Wirkungseintritt und Dauer koennen je nach Route, Dosis, Person und Setting deutlich variieren.
      </Text>
    </View>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  const colors = useThemeColors();

  return (
    <View style={[inlineStyles.infoTile, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
      <Text style={[Typography.quickFactLabel, { color: colors.textTertiary }]}>
        {label}
      </Text>
      <Text style={[Typography.captionBold, { color: colors.textPrimary, marginTop: 2 }]}>
        {value}
      </Text>
    </View>
  );
}

function EffectsContent({
  effects,
}: {
  effects: { positive: string[]; neutral: string[]; negative: string[] };
}) {
  const colors = useThemeColors();

  const groups = [
    {
      label: 'Positiv',
      items: effects.positive,
      color: colors.effectPositive,
      icon: 'add-circle' as const,
    },
    {
      label: 'Neutral',
      items: effects.neutral,
      color: colors.effectNeutral,
      icon: 'remove-circle' as const,
    },
    {
      label: 'Negativ',
      items: effects.negative,
      color: colors.effectNegative,
      icon: 'close-circle' as const,
    },
  ];

  return (
    <View style={{ gap: Spacing.lg }}>
      {groups.filter((group) => group.items.length > 0).map((group) => (
        <View key={group.label}>
          <Text
            style={[
              Typography.captionBold,
              { color: group.color, marginBottom: Spacing.sm },
            ]}>
            {group.label}
          </Text>
          {group.items.map((item) => (
            <View key={item} style={inlineStyles.effectRow}>
              <Ionicons name={group.icon} size={16} color={group.color} />
              <Text
                style={[
                  Typography.body,
                  { color: colors.textPrimary, marginLeft: Spacing.sm, flex: 1 },
                ]}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function RisksContent({
  risks,
  warnings,
}: {
  risks: {
    acute: { name: string; severity: string; description: string }[];
    longterm: { name: string; severity: string; description: string }[];
  };
  warnings: string[];
}) {
  const colors = useThemeColors();

  const renderRisk = (risk: {
    name: string;
    severity: string;
    description: string;
  }) => {
    const severityColor =
      risk.severity === 'high'
        ? colors.riskHigh
        : risk.severity === 'moderate'
          ? colors.riskModerate
          : colors.riskLow;

    return (
      <View
        key={risk.name}
        style={[
          inlineStyles.riskCard,
          { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
        ]}>
        <View style={inlineStyles.riskCardHeader}>
          <View
            style={[inlineStyles.dot, { backgroundColor: severityColor }]}
          />
          <Text
            style={[
              Typography.bodyBold,
              { color: colors.textPrimary, flex: 1 },
            ]}>
            {risk.name}
          </Text>
        </View>
        <Text
          style={[
            Typography.caption,
            { color: colors.textSecondary, marginTop: Spacing.xs },
          ]}>
          {risk.description}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ gap: Spacing.lg }}>
      {risks.acute.length > 0 && (
        <View>
          <Text
            style={[
              Typography.captionBold,
              { color: colors.riskHigh, marginBottom: Spacing.sm },
            ]}>
            Akute Risiken
          </Text>
          <View style={{ gap: Spacing.sm }}>{risks.acute.map(renderRisk)}</View>
        </View>
      )}
      {risks.longterm.length > 0 && (
        <View>
          <Text
            style={[
              Typography.captionBold,
              { color: colors.riskModerate, marginBottom: Spacing.sm },
            ]}>
            Langzeitrisiken
          </Text>
          <View style={{ gap: Spacing.sm }}>
            {risks.longterm.map(renderRisk)}
          </View>
        </View>
      )}
      {warnings.length > 0 && (
        <View>
          <Text
            style={[
              Typography.captionBold,
              { color: colors.severityRisky, marginBottom: Spacing.sm },
            ]}>
            Warnhinweise
          </Text>
          <BulletList items={warnings} />
        </View>
      )}
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  const colors = useThemeColors();

  return (
    <View style={{ gap: Spacing.sm }}>
      {items.map((item) => (
        <View key={item} style={inlineStyles.bulletRow}>
          <View style={[inlineStyles.smallDot, { backgroundColor: colors.textTertiary }]} />
          <Text style={[Typography.body, { color: colors.textPrimary, flex: 1 }]}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SaferUseContent({
  tips,
}: {
  tips: { title: string; description: string }[];
}) {
  const colors = useThemeColors();

  return (
    <View style={{ gap: Spacing.sm }}>
      {tips.map((tip) => (
        <View
          key={tip.title}
          style={[
            inlineStyles.saferUseCard,
            { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
          ]}>
          <Ionicons
            name="shield-checkmark"
            size={18}
            color={colors.effectPositive}
          />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text
              style={[Typography.bodyBold, { color: colors.textPrimary }]}>
              {tip.title}
            </Text>
            <Text
              style={[
                Typography.caption,
                { color: colors.textSecondary, marginTop: 2 },
              ]}>
              {tip.description}
            </Text>
          </View>
        </View>
      ))}
      <Text style={[Typography.caption, { color: colors.textTertiary, marginTop: Spacing.xs }]}>
        Hinweise reduzieren Risiken, machen Konsum aber nicht risikofrei.
      </Text>
    </View>
  );
}

function SourcesContent({
  sources,
  lastUpdated,
  evidenceNote,
}: {
  sources: { author: string; year: number; title: string; doi?: string }[];
  lastUpdated: string;
  evidenceNote?: string;
}) {
  const colors = useThemeColors();

  return (
    <View>
      {evidenceNote && (
        <Text
          style={[
            Typography.caption,
            { color: colors.textSecondary, marginBottom: Spacing.md },
          ]}>
          {evidenceNote}
        </Text>
      )}
      {lastUpdated && (
        <Text
          style={[
            Typography.caption,
            { color: colors.textTertiary, marginBottom: Spacing.md },
          ]}>
          Letzte Aktualisierung: {lastUpdated}
        </Text>
      )}
      <View style={{ gap: Spacing.md }}>
        {sources.map((source, i) => (
          <View key={i}>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
              {source.author} ({source.year})
            </Text>
            <Text
              style={[
                Typography.body,
                { color: colors.textPrimary, marginTop: 2 },
              ]}>
              {source.title}
            </Text>
            {source.doi && (
              <Text
                style={[
                  Typography.caption,
                  { color: colors.accent, marginTop: 2 },
                ]}>
                DOI: {source.doi}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function HarmReductionBox({ riskLevel }: { riskLevel: RiskLevel }) {
  const colors = useThemeColors();
  const highRisk = riskLevel === 'high' || riskLevel === 'extreme';

  return (
    <View
      style={[
        inlineStyles.harmReductionBox,
        {
          backgroundColor: highRisk ? 'rgba(214,58,74,0.10)' : colors.backgroundSecondary,
          borderColor: highRisk ? `${colors.riskExtreme}55` : colors.border,
        },
      ]}>
      <Ionicons
        name={highRisk ? 'warning-outline' : 'information-circle-outline'}
        size={20}
        color={highRisk ? colors.riskExtreme : colors.accent}
      />
      <View style={inlineStyles.harmReductionText}>
        <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>
          {highRisk ? 'Erhoehten Risikokontext beachten' : 'Harm-Reduction-Hinweis'}
        </Text>
        <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
          Keine medizinische Beratung. Bei Bewusstlosigkeit, Atemproblemen, Brustschmerz, Krampfanfall oder ungewoehnlich schweren Symptomen sofort medizinische Hilfe holen. Fehlende Daten bedeuten nicht sicher.
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
  },
  errorTitle: {
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  retryButton: {
    marginTop: Spacing.lg,
    minHeight: 44,
    minWidth: 156,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  skeletonWrap: {
    flex: 1,
  },
  skeletonNav: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.page,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  skeletonIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
  },
  skeletonHero: {
    marginHorizontal: Spacing.page,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
  },
  skeletonCard: {
    marginHorizontal: Spacing.page,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
  },
  skeletonLine: {
    height: 14,
    borderRadius: Radius.full,
    opacity: 0.72,
  },
  skeletonTitleLine: {
    flex: 1,
    maxWidth: 160,
  },
  skeletonLargeLine: {
    width: '72%',
    height: 28,
  },
  skeletonMediumLine: {
    width: '48%',
  },
  skeletonFullLine: {
    width: '100%',
  },
  skeletonChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  skeletonChip: {
    width: 76,
    height: 28,
    borderRadius: Radius.full,
  },
});

const inlineStyles = StyleSheet.create({
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginHorizontal: Spacing.page,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sourceRow: {
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.page,
    marginBottom: Spacing.sm,
  },
  dataQualityNote: {
    marginHorizontal: Spacing.page,
    marginBottom: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  dataQualityText: {
    flex: 1,
  },
  fallbackBox: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  fallbackText: {
    flex: 1,
  },
  infoTile: {
    flex: 1,
    minWidth: 128,
    minHeight: 72,
    padding: Spacing.md,
    borderRadius: Radius.md,
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  effectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  riskCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  riskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  smallDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  saferUseCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bottomDisclaimer: {
    paddingHorizontal: Spacing.page,
    paddingTop: Spacing.lg,
  },
  harmReductionBox: {
    marginHorizontal: Spacing.page,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  harmReductionText: {
    flex: 1,
  },
});
