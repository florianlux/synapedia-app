import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, Typography, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

export type SourceBadgeState = 'live' | 'mixed' | 'local' | 'offline';

function sourceMeta(source: SourceBadgeState, colors: ThemeColors): { label: string; tint: string } {
  if (source === 'live') return { label: 'Live-Daten', tint: colors.accent };
  if (source === 'mixed') return { label: 'Live + Fallback', tint: colors.accent };
  if (source === 'offline') return { label: 'Offline-Fallback', tint: colors.severityRisky };
  return { label: 'Lokal', tint: colors.textTertiary };
}

export function SourceBadge({
  source,
  refreshing,
}: {
  source: SourceBadgeState;
  refreshing: boolean;
}) {
  const colors = useThemeColors();
  const meta = sourceMeta(source, colors);
  const label = refreshing ? 'Synchronisiere' : meta.label;
  const tint = refreshing ? colors.textTertiary : meta.tint;

  return (
    <View style={[styles.badge, { backgroundColor: `${tint}12`, borderColor: `${tint}28` }]}>
      <View style={[styles.dot, { backgroundColor: tint }]} />
      <Text style={[Typography.quickFactLabel, { color: tint }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 22,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    maxWidth: 174,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
