import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Elevation, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function StateCard({
  icon,
  title,
  body,
  loading = false,
  danger = false,
  actionLabel,
  onAction,
}: {
  icon: IconName;
  title: string;
  body: string;
  loading?: boolean;
  danger?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const colors = useThemeColors();
  const tint = danger ? colors.severityRisky : colors.accent;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: danger ? `${colors.severityRisky}10` : colors.backgroundElevated,
          borderColor: danger ? `${colors.severityRisky}40` : colors.cardBorder,
          shadowColor: tint,
        },
      ]}>
      <View style={[styles.iconBox, { backgroundColor: `${tint}18` }]}>
        {loading ? (
          <ActivityIndicator size="small" color={tint} />
        ) : (
          <Ionicons name={icon} size={24} color={tint} />
        )}
      </View>
      <Text style={[Typography.bodyBold, styles.title, { color: colors.textPrimary }]}>
        {title}
      </Text>
      <Text style={[Typography.caption, styles.body, { color: colors.textSecondary }]}>
        {body}
      </Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.action,
            {
              backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}>
          <Text style={[Typography.captionBold, { color: tint }]}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={15} color={tint} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
    marginHorizontal: Spacing.page,
    padding: Spacing.xl,
    ...Elevation.subtle,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
  body: {
    maxWidth: 310,
    textAlign: 'center',
  },
  action: {
    minHeight: 40,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
});
