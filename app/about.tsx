import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Elevation, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

type InfoItem = {
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const SAFETY_ITEMS: InfoItem[] = [
  {
    title: 'Educational reference only',
    body: 'Synapedia summarizes substance, interaction, and recovery context for learning and reflection.',
    icon: 'book-outline',
  },
  {
    title: 'No medical advice',
    body: 'The app does not diagnose, treat, prescribe, or replace professional care. For medical decisions, contact a qualified professional.',
    icon: 'medkit-outline',
  },
  {
    title: 'No emergency service',
    body: 'Synapedia is not monitored and cannot respond to urgent situations. In emergencies, contact local emergency services immediately.',
    icon: 'alert-circle-outline',
  },
  {
    title: 'No encouragement',
    body: 'Content is intended to communicate risks and uncertainty, not to encourage illegal substance use or risky behavior.',
    icon: 'shield-outline',
  },
];

const PRIVACY_ITEMS: InfoItem[] = [
  {
    title: 'Local notes',
    body: 'Private Check-in entries stay on this device unless you explicitly export or share them.',
    icon: 'lock-closed-outline',
  },
  {
    title: 'API lookups',
    body: 'Wiki searches, detail lookups, and MixCheck requests may contact synapedia.com to return live results.',
    icon: 'cloud-outline',
  },
  {
    title: 'No tracking stack',
    body: 'The current app code does not add advertising SDKs, tracking permission, location, HealthKit, or analytics SDKs.',
    icon: 'eye-off-outline',
  },
];

export default function AboutScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.navBar,
          { paddingTop: insets.top, backgroundColor: colors.backgroundGlass, borderBottomColor: colors.separator },
        ]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.navButton}>
          <Ionicons name="chevron-back" size={28} color={colors.accent} />
        </Pressable>
        <Text style={[Typography.navTitle, styles.navTitle, { color: colors.textPrimary }]}>
          Safety & Privacy
        </Text>
        <View style={styles.navButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.screenBottom },
        ]}>
        <View style={[styles.hero, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
          <View style={[styles.heroIcon, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="shield-checkmark-outline" size={26} color={colors.accent} />
          </View>
          <Text style={[Typography.heroTitle, styles.title, { color: colors.textPrimary }]}>
            Review scope
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary }]}>
            Synapedia is an educational harm-reduction reference. It is designed to make risk context visible, not to provide medical care or operational guidance.
          </Text>
        </View>

        <Section title="Safety Boundaries" items={SAFETY_ITEMS} />
        <Section title="Privacy Boundaries" items={PRIVACY_ITEMS} />

        <View style={[styles.footerNote, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
          <Text style={[Typography.caption, styles.footerText, { color: colors.textSecondary }]}>
            Backend logging and retention for synapedia.com must be verified in the privacy policy before public App Store submission.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, items }: { title: string; items: InfoItem[] }) {
  const colors = useThemeColors();

  return (
    <View style={styles.section}>
      <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      <View style={styles.cardList}>
        {items.map((item) => (
          <View
            key={item.title}
            style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
            <View style={[styles.cardIcon, { backgroundColor: colors.backgroundSecondary }]}>
              <Ionicons name={item.icon} size={19} color={colors.accent} />
            </View>
            <View style={styles.cardText}>
              <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>
                {item.title}
              </Text>
              <Text style={[Typography.caption, styles.cardBody, { color: colors.textSecondary }]}>
                {item.body}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

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
  content: {
    padding: Spacing.page,
  },
  hero: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    ...Elevation.subtle,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  section: {
    marginTop: Spacing.xxl,
    gap: Spacing.md,
  },
  cardList: {
    gap: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    ...Elevation.subtle,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardBody: {
    marginTop: Spacing.xs,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.xxl,
    padding: Spacing.md,
  },
  footerText: {
    flex: 1,
  },
});
