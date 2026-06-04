import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import { Typography, Spacing } from '@/constants/theme';
import type { DurationPhase } from '@/types/substance';

interface Props {
  phases: DurationPhase[];
  total: string;
}

export function DurationSection({ phases, total }: Props) {
  const colors = useThemeColors();

  return (
    <View>
      {phases.map((phase, index) => (
        <View
          key={phase.label}
          style={[
            styles.row,
            index < phases.length - 1 && {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.separator,
            },
          ]}>
          <Text
            style={[Typography.body, { color: colors.textSecondary, flex: 1 }]}>
            {phase.label}
          </Text>
          <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>
            {phase.value}
          </Text>
        </View>
      ))}
      <View style={styles.totalRow}>
        <Text
          style={[Typography.bodyBold, { color: colors.textPrimary, flex: 1 }]}>
          Gesamt
        </Text>
        <Text style={[Typography.bodyBold, { color: colors.accent }]}>
          {total}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
});
