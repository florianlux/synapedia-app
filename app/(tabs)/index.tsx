import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router, type Href } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { SUBSTANCES } from '@/constants/mock-data';
import { Elevation, Radius, Spacing, Typography, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import type { RiskLevel } from '@/types/substance';
import {
  DisclaimerCard,
  Pill,
  PremiumCard,
  Screen,
  SectionHeader,
} from '@/components/ui/premium';
import { SynapediaGraphCard } from '@/components/visual/SynapediaGraphCard';

type IconName = ComponentProps<typeof Ionicons>['name'];

const QUICK_ACTIONS: {
  title: string;
  subtitle: string;
  icon: IconName;
  route: '/(tabs)/wiki' | '/(tabs)/check' | '/(tabs)/log' | '/(tabs)/guides';
  tint: string;
}[] = [
  {
    title: 'MixCheck',
    subtitle: 'Zwei Substanzen live und lokal prüfen',
    icon: 'git-compare-outline',
    route: '/(tabs)/check',
    tint: '#FF9F0A',
  },
  {
    title: 'Wiki',
    subtitle: 'Substanzen, Risiken und Wirkprofile',
    icon: 'library-outline',
    route: '/(tabs)/wiki',
    tint: '#4DA3FF',
  },
  {
    title: 'Private Check-in',
    subtitle: 'Lokale Reflexionsnotizen',
    icon: 'create-outline',
    route: '/(tabs)/log',
    tint: '#30D158',
  },
  {
    title: 'Guides',
    subtitle: 'Recovery & Harm Reduction',
    icon: 'heart-circle-outline',
    route: '/(tabs)/guides',
    tint: '#D63A4A',
  },
];

const SAFETY_NOTE =
  'Mischkonsum, Downer-Kombinationen und akute Symptome ernst nehmen. Bei Bewusstlosigkeit, Atemproblemen, Brustschmerz oder Krampfanfällen sofort medizinische Hilfe holen.';

const FEATURED_SUBSTANCES = ['mdma', 'lsd', 'ketamin', 'kokain', 'diazepam'];

const HERO_NODES = [
  { label: 'Wiki', left: '52%', top: 58, tint: '#36A3FF' },
  { label: 'Check', left: '72%', top: 92, tint: '#FFB340' },
  { label: '', left: '64%', top: 28, tint: '#7AE4FF' },
] as const;

const HERO_LINES = [
  { left: '59%', top: 54, width: '20%', rotate: '28deg', tint: '#36A3FF' },
  { left: '57%', top: 86, width: '26%', rotate: '-11deg', tint: '#FFB340' },
] as const;

function getRiskColor(level: RiskLevel, colors: ThemeColors): string {
  const map: Record<RiskLevel, string> = {
    low: colors.riskLow,
    moderate: colors.riskModerate,
    high: colors.riskHigh,
    extreme: colors.riskExtreme,
    unknown: colors.riskUnknown,
  };
  return map[level];
}

export default function HomeScreen() {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const featured = FEATURED_SUBSTANCES.map((slug) =>
    SUBSTANCES.find((substance) => substance.slug === slug),
  ).filter(Boolean);

  return (
    <Screen>
      <View
        style={[
          styles.hero,
          {
            backgroundColor: colors.backgroundElevated,
            borderColor: colors.cardBorder,
          },
        ]}>
        <View pointerEvents="none" style={styles.heroBackground}>
          <View style={[styles.heroWash, { backgroundColor: colors.accentLight }]} />
          <View style={[styles.heroRiskWash, { backgroundColor: colors.severityRisky }]} />
          <View style={[styles.heroSignalLine, { backgroundColor: colors.accent }]} />
          <View style={styles.heroGraph}>
            {HERO_LINES.map((line, index) => (
              <View
                key={`${line.tint}-${index}`}
                style={[
                  styles.heroGraphLine,
                  {
                    left: line.left,
                    top: line.top,
                    width: line.width,
                    backgroundColor: line.tint,
                    transform: [{ rotate: line.rotate }],
                  },
                ]}
              />
            ))}
            {HERO_NODES.map((node) => (
              <View
                key={`${node.label}-${node.top}`}
                style={[
                  styles.heroGraphNode,
                  {
                    left: node.left,
                    top: node.top,
                    backgroundColor: `${node.tint}0D`,
                    borderColor: `${node.tint}32`,
                  },
                ]}>
                {node.label.length > 0 && (
                  <Text
                    style={[Typography.quickFactLabel, styles.heroNodeLabel, { color: `${node.tint}DD` }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit>
                    {node.label}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.heroTop, isCompact && styles.heroTopCompact]}>
          <View style={[styles.mark, { backgroundColor: colors.backgroundSecondary, borderColor: `${colors.accent}35` }]}>
            <View style={[styles.markInner, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="pulse-outline" size={28} color={colors.accent} />
            </View>
          </View>
          <View style={[styles.heroStatus, isCompact && styles.heroTopCompactStatus]}>
            <HeroBadge label="Knowledge Graph" icon="git-network-outline" tint={colors.accent} />
            <HeroBadge label="Risk Awareness" icon="shield-outline" tint={colors.riskModerate} />
          </View>
        </View>

        <Text style={[Typography.heroTitle, styles.title, { color: colors.textPrimary }]}>
          Synapedia
        </Text>
        <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
          Der schnelle iOS-Startpunkt fuer Interaktionen, Substanzwissen und Recovery-Kontext.
        </Text>

        <Pressable
          onPress={() => router.push('/(tabs)/check')}
          accessibilityRole="button"
          accessibilityLabel="MixCheck starten">
          {({ pressed }) => (
            <View
              style={[
                styles.primaryCta,
                {
                  backgroundColor: pressed ? '#F79A0A' : colors.severityRisky,
                  shadowColor: colors.severityRisky,
                },
              ]}>
              <Ionicons name="git-compare" size={18} color="#140D03" />
              <Text style={[Typography.bodyBold, styles.primaryCtaText]}>
                MixCheck starten
              </Text>
              <Ionicons name="arrow-forward" size={17} color="#140D03" />
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.firstSectionHeader}>
        <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]}>Werkzeuge</Text>
        <Text style={[Typography.caption, { color: colors.textSecondary }]}>
          MixCheck zuerst, Recherche und Notizen bleiben einen Tap entfernt.
        </Text>
      </View>
      <View style={styles.actionList}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.title}
            onPress={() => router.push(action.route)}
            accessibilityLabel={action.title}>
            {({ pressed }) => (
              <PremiumCard pressed={pressed} style={[styles.actionCard, isCompact && styles.actionCardCompact]}>
                <View style={[styles.actionAccent, { backgroundColor: action.tint }]} />
                <View style={[styles.actionIcon, { backgroundColor: `${action.tint}1F` }]}>
                  <Ionicons name={action.icon} size={22} color={action.tint} />
                </View>
                <View style={styles.actionText}>
                  <Text
                    style={[Typography.bodyBold, styles.actionTitle, { color: colors.textPrimary }]}
                    numberOfLines={1}>
                    {action.title}
                  </Text>
                  <Text
                    style={[Typography.caption, styles.actionSubtitle, { color: colors.textSecondary }]}
                    numberOfLines={2}>
                    {action.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </PremiumCard>
            )}
          </Pressable>
        ))}
      </View>

      <PremiumCard style={styles.warningCard}>
        <View style={[styles.warningAccent, { backgroundColor: colors.severityRisky }]} />
        <View style={[styles.warningIcon, { backgroundColor: 'rgba(255,159,10,0.13)' }]}>
          <Ionicons name="medical-outline" size={20} color={colors.severityRisky} />
        </View>
        <View style={styles.warningText}>
          <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>Sicherheitsfokus</Text>
          <Text style={[Typography.caption, styles.warningLine, { color: colors.textSecondary }]}>
            {SAFETY_NOTE}
          </Text>
        </View>
      </PremiumCard>

      <Pressable
        onPress={() => router.push('/about' as Href)}
        accessibilityRole="button"
        accessibilityLabel="Safety and Privacy">
        {({ pressed }) => (
          <PremiumCard pressed={pressed} style={styles.aboutCard}>
            <View style={[styles.actionIcon, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.accent} />
            </View>
            <View style={styles.actionText}>
              <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>
                Safety & Privacy
              </Text>
              <Text style={[Typography.caption, styles.actionSubtitle, { color: colors.textSecondary }]}>
                Educational scope, local notes, and API lookups.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </PremiumCard>
        )}
      </Pressable>

      <SectionHeader
        title="Schnell nachschlagen"
        subtitle="Schneller Einstieg in lokale Wiki-Profile"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.substanceRail}>
        {featured.map((substance) => {
          if (!substance) return null;
          const riskColor = getRiskColor(substance.riskLevel, colors);

          return (
            <Pressable
              key={substance.slug}
              onPress={() => router.push({ pathname: '/substance/[slug]', params: { slug: substance.slug } })}
              style={({ pressed }) => [
                styles.substanceCard,
                {
                  backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundElevated,
                  borderColor: colors.cardBorder,
                },
              ]}>
              <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>{substance.name}</Text>
              <Text style={[Typography.caption, styles.substanceClass, { color: colors.textSecondary }]}>
                {substance.primaryClass}
              </Text>
              <Pill label={substance.riskLabel} tint={riskColor} />
              <Text style={[Typography.caption, styles.substanceDuration, { color: colors.textTertiary }]}>
                {substance.quickFacts.duration}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.graphSection}>
        <SynapediaGraphCard />
      </View>

      <PremiumCard style={styles.didYouKnow}>
        <Text style={[Typography.captionBold, { color: colors.accent }]}>Hinweis</Text>
        <Text style={[Typography.bodyBold, styles.didYouKnowTitle, { color: colors.textPrimary }]}>
          „Keine Daten“ bedeutet nicht „sicher“.
        </Text>
        <Text style={[Typography.caption, { color: colors.textSecondary }]}>
          MixCheck nutzt Live-Daten und lokale kuratierte Fallbacks. Unbekannte Kombinationen koennen
          trotzdem riskant oder unvorhersehbar sein.
        </Text>
      </PremiumCard>

      <DisclaimerCard text="Educational reference only. No medical advice or emergency service." />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    minHeight: 260,
    ...Elevation.card,
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  heroWash: {
    position: 'absolute',
    top: -58,
    right: -58,
    width: 250,
    height: 156,
    borderRadius: Radius.full,
    opacity: 0.36,
    transform: [{ rotate: '-10deg' }],
  },
  heroRiskWash: {
    position: 'absolute',
    bottom: -72,
    left: -52,
    width: 170,
    height: 140,
    borderRadius: Radius.full,
    opacity: 0.06,
  },
  heroSignalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 2,
    opacity: 0.56,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  heroTopCompact: {
    flexDirection: 'column',
  },
  mark: {
    width: 54,
    height: 54,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markInner: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatus: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
    flexShrink: 1,
  },
  heroTopCompactStatus: {
    alignItems: 'flex-start',
  },
  heroBadge: {
    minHeight: 24,
    maxWidth: 190,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  heroBadgeText: {
    flexShrink: 1,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    maxWidth: 430,
  },
  primaryCta: {
    alignSelf: 'flex-start',
    minHeight: 48,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  primaryCtaText: {
    color: '#140D03',
  },
  heroGraph: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.82,
  },
  heroGraphLine: {
    position: 'absolute',
    height: 1,
    opacity: 0.2,
  },
  heroGraphNode: {
    position: 'absolute',
    width: 52,
    height: 32,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  heroNodeLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  graphSection: {
    marginTop: Spacing.xl,
  },
  firstSectionHeader: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  actionList: {
    gap: Spacing.sm,
  },
  actionCard: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  actionCardCompact: {
    minHeight: 76,
  },
  actionAccent: {
    position: 'absolute',
    left: 0,
    top: Spacing.md,
    bottom: Spacing.md,
    width: 3,
    borderTopRightRadius: Radius.full,
    borderBottomRightRadius: Radius.full,
    opacity: 0.9,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
    minWidth: 0,
  },
  actionTitle: {
    includeFontPadding: false,
  },
  actionSubtitle: {
    marginTop: Spacing.xs,
  },
  warningCard: {
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    paddingLeft: Spacing.xl,
  },
  aboutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  warningAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    opacity: 0.9,
  },
  warningIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  warningText: {
    flex: 1,
  },
  warningLine: {
    marginTop: Spacing.xs,
  },
  substanceRail: {
    gap: Spacing.sm,
    paddingRight: Spacing.page,
  },
  substanceCard: {
    width: 168,
    minHeight: 140,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  substanceClass: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  substanceDuration: {
    marginTop: Spacing.md,
  },
  didYouKnow: {
    marginTop: Spacing.xl,
  },
  didYouKnowTitle: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
});

function HeroBadge({
  label,
  icon,
  tint,
}: {
  label: string;
  icon: IconName;
  tint: string;
}) {
  return (
    <View style={[styles.heroBadge, { backgroundColor: `${tint}12`, borderColor: `${tint}24` }]}>
      <Ionicons name={icon} size={12} color={tint} />
      <Text style={[Typography.quickFactLabel, styles.heroBadgeText, { color: tint }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
