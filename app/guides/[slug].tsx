import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { GUIDE_DISCLAIMER, type GuidePhase, type GuideSection } from '@/constants/guides';
import { Elevation, Radius, Spacing, Typography } from '@/constants/theme';
import { useGuide } from '@/hooks/use-guides';
import { useThemeColors } from '@/hooks/use-theme';
import { SourceBadge } from '@/components/ui/SourceBadge';

export default function GuideDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const guideState = useGuide(slug);

  if (guideState.status === 'loading') {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[Typography.body, styles.centeredText, { color: colors.textSecondary }]}>
          Lade Guide...
        </Text>
      </View>
    );
  }

  if (guideState.status === 'error') {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={44} color={colors.textTertiary} />
        <Text style={[Typography.body, styles.centeredText, { color: colors.textSecondary }]}>
          {guideState.notFound ? 'Guide nicht gefunden.' : 'Guide konnte nicht geladen werden.'}
        </Text>
        <Pressable onPress={() => router.back()} style={styles.backTextButton}>
          <Text style={[Typography.bodyBold, { color: colors.accent }]}>Zurück</Text>
        </Pressable>
      </View>
    );
  }

  const guide = guideState.data;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.navBar,
          { paddingTop: insets.top, borderBottomColor: colors.separator },
        ]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.navButton}>
          <Ionicons name="chevron-back" size={28} color={colors.accent} />
        </Pressable>
        <Text style={[Typography.navTitle, styles.navTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {guide.title}
        </Text>
        <View style={styles.navButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={[Typography.captionBold, { color: guide.accent }]}>{guide.category}</Text>
          <Text style={[Typography.heroTitle, styles.title, { color: colors.textPrimary }]}>
            {guide.title}
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary }]}>
            {guide.summary}
          </Text>
          <View style={styles.sourceRow}>
            <SourceBadge source={guideState.source} refreshing={guideState.refreshing} />
          </View>
        </View>

        {(guide.safetyDisclaimer || GUIDE_DISCLAIMER) && (
          <View style={[styles.disclaimer, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
          <Ionicons name="warning-outline" size={18} color={colors.severityRisky} />
          <View style={styles.disclaimerText}>
            <Text style={[Typography.captionBold, { color: colors.textPrimary }]}>
              Wichtiger Sicherheitshinweis
            </Text>
            {guide.safetyDisclaimer && (
              <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                {guide.safetyDisclaimer}
              </Text>
            )}
            <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
              {GUIDE_DISCLAIMER}
            </Text>
          </View>
          </View>
        )}

        {guide.symptoms.length > 0 && <GuideSections sections={guide.symptoms} />}

        {guide.phases.length > 0 && (
          <View style={styles.section}>
            <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]}>
              Phasenüberblick
            </Text>
            <View style={styles.phaseList}>
              {guide.phases.map((phase) => (
                <PhaseCard key={phase.label} phase={phase} accent={guide.accent} />
              ))}
            </View>
          </View>
        )}

        {guide.redFlags.length > 0 && (
          <BulletSection
            title="Red Flags / Wann Hilfe holen?"
            icon="alert-circle-outline"
            items={guide.redFlags}
            danger
          />
        )}

        {guide.practicalSteps.length > 0 && (
          <BulletSection
            title="Praktische Harm-Reduction-Schritte"
            icon="shield-checkmark-outline"
            items={guide.practicalSteps}
          />
        )}

        {guide.evidenceNote && (
          <View style={[styles.evidenceCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <Ionicons name="document-text-outline" size={18} color={colors.accent} />
            <View style={styles.evidenceText}>
              <Text style={[Typography.captionBold, { color: colors.textPrimary }]}>
                Evidenz / Quellen
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                {guide.evidenceNote}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function GuideSections({ sections }: { sections: GuideSection[] }) {
  const colors = useThemeColors();

  return (
    <View style={styles.section}>
      <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]}>
        Symptome & Support
      </Text>
      <View style={styles.cardList}>
        {sections.map((section) => (
          <View key={section.title} style={[styles.infoCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
            <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>
              {section.title}
            </Text>
            <BulletList items={section.items} />
          </View>
        ))}
      </View>
    </View>
  );
}

function PhaseCard({ phase, accent }: { phase: GuidePhase; accent: string }) {
  const colors = useThemeColors();

  return (
    <View style={[styles.phaseCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
      <View style={[styles.phaseDot, { backgroundColor: accent }]} />
      <View style={styles.phaseContent}>
        <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>
          {phase.label}
        </Text>
        <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
          {phase.description}
        </Text>
      </View>
    </View>
  );
}

function BulletSection({
  title,
  icon,
  items,
  danger,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: string[];
  danger?: boolean;
}) {
  const colors = useThemeColors();
  const accent = danger ? colors.severityDangerous : colors.accent;

  return (
    <View style={[styles.bulletSection, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name={icon} size={18} color={accent} />
        <Text style={[Typography.sectionTitle, { color: colors.textPrimary, flex: 1 }]}>
          {title}
        </Text>
      </View>
      <BulletList items={items} danger={danger} />
    </View>
  );
}

function BulletList({ items, danger }: { items: string[]; danger?: boolean }) {
  const colors = useThemeColors();
  const dotColor = danger ? colors.severityDangerous : colors.textTertiary;

  return (
    <View style={styles.bulletList}>
      {items.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
          <Text style={[Typography.body, { color: colors.textPrimary, flex: 1 }]}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  centeredText: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  backTextButton: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
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
  content: {
    padding: Spacing.page,
    paddingBottom: Spacing.screenBottom,
  },
  hero: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sourceRow: {
    alignItems: 'flex-start',
    marginTop: Spacing.md,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.xl,
    ...Elevation.subtle,
  },
  disclaimerText: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  cardList: {
    gap: Spacing.sm,
  },
  infoCard: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
    ...Elevation.subtle,
  },
  phaseList: {
    gap: Spacing.sm,
  },
  phaseCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    ...Elevation.subtle,
  },
  phaseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  phaseContent: {
    flex: 1,
  },
  bulletSection: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    ...Elevation.subtle,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bulletList: {
    gap: Spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 8,
  },
  evidenceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  evidenceText: {
    flex: 1,
  },
});
