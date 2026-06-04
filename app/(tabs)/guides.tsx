import type { ComponentProps } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const GUIDES: {
  title: string;
  subtitle: string;
  status: string;
  icon: IconName;
  tint: string;
}[] = [
  {
    title: 'Opioid Withdrawal',
    subtitle: 'Taper planning, red flags, hydration, sleep, and when to seek medical help.',
    status: 'Recovery guide',
    icon: 'medkit-outline',
    tint: '#0A84FF',
  },
  {
    title: 'Benzodiazepine Withdrawal',
    subtitle: 'Seizure-risk awareness, slow taper principles, symptoms, and support planning.',
    status: 'High-risk guide',
    icon: 'warning-outline',
    tint: '#FF9F0A',
  },
  {
    title: 'Phenibut Withdrawal',
    subtitle: 'Dependence warning signs, rebound anxiety, taper notes, and escalation triggers.',
    status: 'Curated guide',
    icon: 'pulse-outline',
    tint: '#D63A4A',
  },
];

export default function GuidesScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[Typography.heroTitle, { color: colors.textPrimary }]}>Guides</Text>
          <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
            Mobile-first recovery and harm-reduction guides for the Synapedia content library.
          </Text>
        </View>

        <View style={styles.guideList}>
          {GUIDES.map((guide) => (
            <View
              key={guide.title}
              style={[styles.guideCard, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={[styles.iconBox, { backgroundColor: `${guide.tint}20` }]}>
                <Ionicons name={guide.icon} size={23} color={guide.tint} />
              </View>
              <View style={styles.guideContent}>
                <Text style={[Typography.captionBold, { color: guide.tint }]}>
                  {guide.status}
                </Text>
                <Text style={[Typography.bodyBold, styles.guideTitle, { color: colors.textPrimary }]}>
                  {guide.title}
                </Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  {guide.subtitle}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.note, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
          <Text style={[Typography.caption, styles.noteText, { color: colors.textSecondary }]}>
            Guide detail pages are intentionally not implemented in this shell pass.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  guideList: {
    gap: Spacing.sm,
  },
  guideCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  noteText: {
    flex: 1,
  },
});
