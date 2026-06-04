import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import { Typography, Spacing, Radius } from '@/constants/theme';
import type { Substance } from '@/types/substance';
import { RiskBanner } from './RiskBanner';

interface Props {
  substance: Substance;
}

export function HeroHeader({ substance }: Props) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { borderBottomColor: colors.separator }]}>
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
            style={[styles.chip, { backgroundColor: colors.backgroundSecondary }]}>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
  },
});
