import type { ComponentProps, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Elevation, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function Screen({
  children,
  scroll = true,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
}) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const content = [
    styles.screenContent,
    { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.screenBottom },
    contentStyle,
  ];

  if (!scroll) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={content}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

export function PremiumCard({
  children,
  style,
  pressed,
}: {
  children: ReactNode;
  style?: ViewStyle;
  pressed?: boolean;
}) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.card,
        Elevation.subtle,
        {
          backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundElevated,
          borderColor: colors.cardBorder,
          transform: [{ scale: pressed ? 0.995 : 1 }],
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export function PressableCard({
  children,
  onPress,
  style,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
      {({ pressed }) => (
        <PremiumCard pressed={pressed} style={style}>
          {children}
        </PremiumCard>
      )}
    </Pressable>
  );
}

export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const colors = useThemeColors();

  return (
    <View style={styles.sectionHeader}>
      <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
      {subtitle && (
        <Text style={[Typography.caption, { color: colors.textSecondary }]}>{subtitle}</Text>
      )}
    </View>
  );
}

export function Pill({
  label,
  tint,
  icon,
}: {
  label: string;
  tint?: string;
  icon?: IconName;
}) {
  const colors = useThemeColors();
  const color = tint ?? colors.textSecondary;

  return (
    <View style={[styles.pill, { backgroundColor: `${color}18`, borderColor: `${color}26` }]}>
      {icon && <Ionicons name={icon} size={13} color={color} />}
      <Text style={[Typography.chip, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  body,
}: {
  icon: IconName;
  title: string;
  body: string;
}) {
  const colors = useThemeColors();

  return (
    <PremiumCard style={styles.emptyCard}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundTertiary }]}>
        <Ionicons name={icon} size={26} color={colors.textTertiary} />
      </View>
      <Text style={[Typography.bodyBold, { color: colors.textPrimary, textAlign: 'center' }]}>
        {title}
      </Text>
      <Text style={[Typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}>
        {body}
      </Text>
    </PremiumCard>
  );
}

export function DisclaimerCard({ text }: { text: string }) {
  const colors = useThemeColors();

  return (
    <View style={[styles.disclaimer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
      <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
      <Text style={[Typography.caption, { color: colors.textSecondary, flex: 1 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenContent: {
    paddingHorizontal: Spacing.page,
  },
  card: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
  },
  sectionHeader: {
    gap: Spacing.xs,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  pill: {
    minHeight: 30,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    maxWidth: '100%',
  },
  emptyCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.xl,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
});
