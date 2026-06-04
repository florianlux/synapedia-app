import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { SUBSTANCES } from '@/constants/mock-data';
import { Radius, Spacing, Typography, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import type { RiskLevel } from '@/types/substance';
import {
  DisclaimerCard,
  Pill,
  PressableCard,
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
    subtitle: 'Kuratierte Hinweise zu Kombinationen',
    icon: 'git-compare-outline',
    route: '/(tabs)/check',
    tint: '#FF9F0A',
  },
  {
    title: 'Dose Log',
    subtitle: 'Lokal dokumentieren, ruhig reflektieren',
    icon: 'create-outline',
    route: '/(tabs)/log',
    tint: '#30D158',
  },
  {
    title: 'Guides',
    subtitle: 'Recovery und Harm Reduction lesen',
    icon: 'heart-circle-outline',
    route: '/(tabs)/guides',
    tint: '#D63A4A',
  },
];

const SAFETY_NOTES = [
  'Mischkonsum, Downer-Kombinationen und akute Symptome immer ernst nehmen.',
  'Bei Bewusstlosigkeit, Atemproblemen, Brustschmerz oder Krampfanfall sofort Hilfe holen.',
];

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
      <View style={styles.hero}>
        <View style={[styles.mark, { backgroundColor: colors.accentLight, borderColor: colors.border }]}>
          <Ionicons name="pulse-outline" size={30} color={colors.accent} />
        </View>
        <Text style={[Typography.heroTitle, styles.title, { color: colors.textPrimary }]}>
          Synapedia
        </Text>
        <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
          Mobiles Harm-Reduction-Wissen für Substanzen, Mischkonsum, Konsumtagebuch und
          Recovery-Guides.
        </Text>
        <View style={styles.heroPills}>
          <Pill label="Lokales MVP" icon="phone-portrait-outline" tint={colors.accent} />
          <Pill label="Keine medizinische Beratung" icon="shield-outline" tint={colors.riskModerate} />
        </View>
      </View>

      <View style={styles.actionGrid}>
        {QUICK_ACTIONS.map((action) => (
          <PressableCard
            key={action.title}
            onPress={() => router.push(action.route)}
            style={styles.actionCard}
            accessibilityLabel={action.title}>
            <View style={[styles.actionIcon, { backgroundColor: `${action.tint}1F` }]}>
              <Ionicons name={action.icon} size={22} color={action.tint} />
            </View>
            <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>{action.title}</Text>
            <Text style={[Typography.caption, styles.actionSubtitle, { color: colors.textSecondary }]}>
              {action.subtitle}
            </Text>
          </PressableCard>
        ))}
      </View>

      <PremiumCard style={styles.warningCard}>
        <View style={[styles.warningIcon, { backgroundColor: 'rgba(255,159,10,0.14)' }]}>
          <Ionicons name="warning-outline" size={20} color={colors.severityRisky} />
        </View>
        <View style={styles.warningText}>
          <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>Sicherheitsfokus</Text>
          {SAFETY_NOTES.map((note) => (
            <Text key={note} style={[Typography.caption, styles.warningLine, { color: colors.textSecondary }]}>
              {note}
            </Text>
          ))}
        </View>
      </PremiumCard>

      <SectionHeader
        title="Populäre Substanzen"
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  mark: {
    width: 58,
    height: 58,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    maxWidth: 430,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionCard: {
    width: '48.5%',
    minHeight: 154,
    justifyContent: 'space-between',
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  actionSubtitle: {
    marginTop: Spacing.xs,
  },
  warningCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  warningIcon: {
    width: 40,
    height: 40,
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
