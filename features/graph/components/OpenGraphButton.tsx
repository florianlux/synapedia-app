import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { router, type Href } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { buildGraphFocusPath, makeSubstanceFocus } from '@/features/graph/navigation';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function OpenGraphButton({
  slug,
  label = 'Im Graph anzeigen',
  safetyMode = false,
  icon = 'git-network-outline',
}: {
  slug: string;
  label?: string;
  safetyMode?: boolean;
  icon?: IconName;
}) {
  const colors = useThemeColors();
  const focus = makeSubstanceFocus(slug);
  const href = focus ? buildGraphFocusPath(focus, { safetyMode }) : undefined;

  return (
    <Pressable
      disabled={!href}
      onPress={() => {
        if (href) router.push(href as unknown as Href);
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundSecondary,
          borderColor: colors.border,
          opacity: href ? 1 : 0.45,
        },
      ]}>
      <Ionicons name={icon} size={17} color={colors.accent} />
      <Text style={[Typography.captionBold, styles.label, { color: colors.textPrimary }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={15} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  label: {
    flex: 1,
  },
});
