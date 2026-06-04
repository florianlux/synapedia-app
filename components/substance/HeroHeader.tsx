import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import { Elevation, Typography, Spacing, Radius } from '@/constants/theme';
import type { Substance } from '@/types/substance';
import { RiskBanner } from './RiskBanner';

interface Props {
  substance: Substance;
}

export function HeroHeader({ substance }: Props) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
      <View pointerEvents="none" style={styles.background}>
        <View style={[styles.signalLine, { backgroundColor: colors.accent }]} />
        <View style={[styles.glow, { backgroundColor: colors.accent }]} />
      </View>
      <Text style={[Typography.heroTitle, { color: colors.textPrimary }]}>
        {substance.name}
      </Text>
      <Text
        style={[
          Typography.caption,
          { color: colors.textSecondary, marginTop: Spacing.xs },
        ]}>
        {substance.chemicalName}
      </Text>
      <View style={styles.chips}>
        {substance.categories.map((cat) => (
          <View
            key={cat}
            style={[styles.chip, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <Text style={[Typography.chip, { color: colors.textSecondary }]}>
              {cat}
            </Text>
          </View>
        ))}
      </View>
      <RiskBanner
        riskLevel={substance.riskLevel}
        riskLabel={substance.riskLabel}
        riskChips={substance.riskChips}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: Spacing.page,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    ...Elevation.subtle,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  signalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 2,
    opacity: 0.65,
  },
  glow: {
    position: 'absolute',
    right: -52,
    top: -44,
    width: 180,
    height: 120,
    borderRadius: Radius.full,
    opacity: 0.12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
