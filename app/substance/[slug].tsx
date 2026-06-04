import { useEffect } from 'react';
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
import { DosageSection } from '@/components/substance/DosageSection';
import { DurationSection } from '@/components/substance/DurationSection';
import { InteractionsPreviewSection } from '@/components/substance/InteractionsPreviewSection';
import { StickyBottomBar } from '@/components/substance/StickyBottomBar';
import { RiskProfileBars } from '@/components/visual/RiskProfileBars';
import { DurationTimeline } from '@/components/visual/DurationTimeline';

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function SubstanceDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite, addRecentlyViewed } = useAppContext();

  const substanceState = useSubstance(slug);
  const isSaved = slug ? isFavorite(slug) : false;

  useEffect(() => {
    if (slug && substanceState.status === 'success') addRecentlyViewed(slug);
  }, [slug, substanceState.status, addRecentlyViewed]);

  // ---- Loading state ----
  if (substanceState.status === 'loading') {
    return (
      <View
        style={[
          styles.centeredContainer,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text
          style={[
            Typography.body,
            { color: colors.textSecondary, marginTop: Spacing.md },
          ]}>
          Lade Substanz…
        </Text>
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
        <Text
          style={[
            Typography.body,
            { color: colors.textSecondary, marginTop: Spacing.md, textAlign: 'center' },
          ]}>
          {substanceState.notFound ? 'Substanz nicht gefunden' : substanceState.message}
        </Text>
        <Pressable onPress={() => router.back()} style={styles.retryButton}>
          <Text style={[Typography.bodyBold, { color: colors.accent }]}>
            Zurück
          </Text>
        </Pressable>
      </View>
    );
  }

  const substance = substanceState.data;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* ── Z1: Nav Bar ── */}
      <View
        style={[
          styles.navBar,
          { paddingTop: insets.top, backgroundColor: colors.backgroundGlass, borderBottomColor: colors.separator },
        ]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.navButton}>
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
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.screenBottom }}
        showsVerticalScrollIndicator={false}>
        {/* Z2: Hero Header */}
        <HeroHeader substance={substance} />

        {/* Z3: Quick Facts */}
        <QuickFactsStrip quickFacts={substance.quickFacts} />

        <RiskProfileBars substance={substance} />
        <DurationTimeline quickFacts={substance.quickFacts} />

        <DisclaimerCard />

        {/* Z4: Expandable Sections */}
        <ExpandableSection title="Überblick">
          <OverviewContent
            summary={substance.summary}
            aliases={substance.aliases}
            primaryClass={substance.primaryClass}
            categories={substance.categories}
          />
        </ExpandableSection>

        <ExpandableSection title="Dosierung" hidden={substance.dosage.routes.length === 0}>
          <DosageSection routes={substance.dosage.routes} />
        </ExpandableSection>

        <ExpandableSection title="Wirkdauer" hidden={substance.duration.phases.length === 0 && substance.duration.total === '—'}>
          <DurationSection
            phases={substance.duration.phases}
            total={substance.duration.total}
          />
        </ExpandableSection>

        <ExpandableSection title="Wirkung" hidden={substance.effects.positive.length === 0 && substance.effects.negative.length === 0}>
          <EffectsContent effects={substance.effects} />
        </ExpandableSection>

        <ExpandableSection title="Risiken" hidden={substance.risks.acute.length === 0 && substance.risks.longterm.length === 0}>
          <RisksContent risks={substance.risks} />
        </ExpandableSection>

        <ExpandableSection title="Safer Use" hidden={substance.saferUse.length === 0}>
          <SaferUseContent tips={substance.saferUse} />
        </ExpandableSection>

        <ExpandableSection
          title="Interaktionen"
          badge={substance.interactions.length}
          hidden={substance.interactions.length === 0}>
          <InteractionsPreviewSection interactions={substance.interactions} />
        </ExpandableSection>

        <ExpandableSection title="Evidenz & Quellen" hidden={substance.sources.length === 0 && !substance.lastUpdated}>
          <SourcesContent
            sources={substance.sources}
            lastUpdated={substance.lastUpdated}
          />
        </ExpandableSection>

        <View style={inlineStyles.bottomDisclaimer}>
          <Text style={[Typography.caption, { color: colors.textTertiary, textAlign: 'center' }]}>
            Informations- und Harm-Reduction-Tool. Keine medizinische Beratung.
          </Text>
        </View>
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
}: {
  summary?: string;
  aliases?: string[];
  primaryClass?: string;
  categories: string[];
}) {
  const colors = useThemeColors();

  return (
    <View style={{ gap: Spacing.md }}>
      {summary && (
        <Text style={[Typography.body, { color: colors.textPrimary }]}>
          {summary}
        </Text>
      )}
      <View style={inlineStyles.overviewGrid}>
        <InfoTile label="Klasse" value={primaryClass ?? categories[0] ?? '—'} />
        <InfoTile label="Aliasse" value={aliases?.length ? aliases.join(', ') : '—'} />
      </View>
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
      {groups.map((group) => (
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
}: {
  risks: {
    acute: { name: string; severity: string; description: string }[];
    longterm: { name: string; severity: string; description: string }[];
  };
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
    </View>
  );
}

function SourcesContent({
  sources,
  lastUpdated,
}: {
  sources: { author: string; year: number; title: string; doi?: string }[];
  lastUpdated: string;
}) {
  const colors = useThemeColors();

  return (
    <View>
      <Text
        style={[
          Typography.caption,
          { color: colors.textTertiary, marginBottom: Spacing.md },
        ]}>
        Letzte Aktualisierung: {lastUpdated}
      </Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
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
    gap: Spacing.sm,
  },
  infoTile: {
    flex: 1,
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
});
