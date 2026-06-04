import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
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

type IconName = ComponentProps<typeof Ionicons>['name'];

const QUICK_ACTIONS: {
  title: string;
  subtitle: string;
  icon: IconName;
  route: '/(tabs)/wiki' | '/(tabs)/check' | '/(tabs)/log' | '/(tabs)/guides';
  tint: string;
}[] = [
  {
    title: 'Wiki',
    subtitle: 'Substanzen, Risiken und Wirkprofile',
    icon: 'library-outline',
    route: '/(tabs)/wiki',
    tint: '#4DA3FF',
  },
  {
    title: 'MixCheck',
    subtitle: 'Kombinationen prüfen',
    icon: 'git-compare-outline',
    route: '/(tabs)/check',
    tint: '#FF9F0A',
  },
  {
    title: 'Dose Log',
    subtitle: 'Konsum lokal dokumentieren',
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
          <View style={[styles.heroSignalLine, { backgroundColor: colors.accent }]} />
        </View>

        <View style={styles.heroTop}>
          <View style={[styles.mark, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <View style={[styles.markInner, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="pulse-outline" size={28} color={colors.accent} />
            </View>
          </View>
          <View style={styles.heroStatus}>
            <HeroBadge label="Lokales MVP" icon="phone-portrait-outline" tint={colors.accent} />
            <HeroBadge label="Keine medizinische Beratung" icon="shield-outline" tint={colors.riskModerate} />
          </View>
        </View>

        <Text style={[Typography.heroTitle, styles.title, { color: colors.textPrimary }]}>
          Synapedia
        </Text>
        <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
          Mobiles Harm-Reduction-Wissen für Substanzen, Mischkonsum, Konsumtagebuch und Recovery.
        </Text>
      </View>

      <View style={styles.firstSectionHeader}>
        <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]}>Schnellzugriff</Text>
      </View>
      <View style={styles.actionList}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.title}
            onPress={() => router.push(action.route)}
            accessibilityLabel={action.title}>
            {({ pressed }) => (
              <PremiumCard pressed={pressed} style={styles.actionCard}>
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

      <PremiumCard style={styles.didYouKnow}>
        <Text style={[Typography.captionBold, { color: colors.accent }]}>Wusstest du?</Text>
        <Text style={[Typography.bodyBold, styles.didYouKnowTitle, { color: colors.textPrimary }]}>
          „Keine Daten“ bedeutet nicht „sicher“.
        </Text>
        <Text style={[Typography.caption, { color: colors.textSecondary }]}>
          MixCheck zeigt nur lokal kuratierte Bewertungen. Unbekannte Kombinationen können trotzdem
          riskant oder unvorhersehbar sein.
        </Text>
      </PremiumCard>

      <DisclaimerCard text="Informations- und Harm-Reduction-Tool. Keine medizinische Beratung." />
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
    ...Elevation.card,
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  heroWash: {
    position: 'absolute',
    top: -42,
    right: -34,
    width: 220,
    height: 132,
    borderRadius: Radius.xl,
    opacity: 0.42,
    transform: [{ rotate: '-10deg' }],
  },
  heroSignalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 2,
    opacity: 0.8,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
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
  firstSectionHeader: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  actionList: {
    gap: Spacing.sm,
  },
  actionCard: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
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
    borderRadius: Radius.lg,
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
    gap: Spacing.md,
    marginTop: Spacing.xl,
    paddingLeft: Spacing.xl,
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
