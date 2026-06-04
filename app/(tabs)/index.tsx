import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const QUICK_ACTIONS: {
  title: string;
  subtitle: string;
  icon: IconName;
  route: '/(tabs)/wiki' | '/(tabs)/check' | '/(tabs)/log' | '/(tabs)/guides';
  tint: string;
}[] = [
  {
    title: 'Drug Wiki',
    subtitle: 'Substance profiles, risks, doses',
    icon: 'library-outline',
    route: '/(tabs)/wiki',
    tint: '#0A84FF',
  },
  {
    title: 'MixCheck',
    subtitle: 'Interaction checker placeholder',
    icon: 'git-compare-outline',
    route: '/(tabs)/check',
    tint: '#FF9F0A',
  },
  {
    title: 'Dose Log',
    subtitle: 'Local-first tracking shell',
    icon: 'create-outline',
    route: '/(tabs)/log',
    tint: '#30D158',
  },
  {
    title: 'Recovery Guides',
    subtitle: 'Withdrawal and harm reduction',
    icon: 'heart-circle-outline',
    route: '/(tabs)/guides',
    tint: '#D63A4A',
  },
];

export default function HomeScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brandBlock}>
          <View style={[styles.mark, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="pulse-outline" size={28} color={colors.accent} />
          </View>
          <Text style={[Typography.heroTitle, styles.title, { color: colors.textPrimary }]}>
            Synapedia
          </Text>
          <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
            A mobile harm-reduction companion for substance knowledge, interaction checks,
            recovery guidance, and local-first dose notes.
          </Text>
        </View>

        <View style={[styles.notice, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.accent} />
          <Text style={[Typography.caption, styles.noticeText, { color: colors.textSecondary }]}>
            Educational information only. This app does not replace medical care or emergency help.
          </Text>
        </View>

        <Text style={[Typography.sectionTitle, styles.sectionTitle, { color: colors.textPrimary }]}>
          Start here
        </Text>

        <View style={styles.actionGrid}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.title}
              onPress={() => router.push(action.route)}
              style={({ pressed }) => [
                styles.actionCard,
                {
                  backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundSecondary,
                },
              ]}>
              <View style={[styles.actionIcon, { backgroundColor: `${action.tint}20` }]}>
                <Ionicons name={action.icon} size={23} color={action.tint} />
              </View>
              <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>
                {action.title}
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                {action.subtitle}
              </Text>
            </Pressable>
          ))}
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
  brandBlock: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  mark: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    maxWidth: 420,
  },
  notice: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
  },
  sectionTitle: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionCard: {
    width: '48.5%',
    minHeight: 144,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    justifyContent: 'space-between',
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
});
