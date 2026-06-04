import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useThemeColors } from '@/hooks/use-theme';
import { Typography, Spacing, Radius } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import type { RiskLevel } from '@/types/substance';

interface Props {
  riskLevel: RiskLevel;
  riskLabel: string;
  riskChips: string[];
}

function getRiskColor(level: RiskLevel, colors: ThemeColors): string {
  const map: Record<RiskLevel, string> = {
    low: colors.riskLow,
    moderate: colors.riskModerate,
    high: colors.riskHigh,
    extreme: colors.riskExtreme,
    unknown: colors.riskUnknown,
  };
  return map[level];
}

function getRiskIcon(level: RiskLevel) {
  if (level === 'low') return 'checkmark-circle' as const;
  if (level === 'extreme') return 'skull-outline' as const;
  if (level === 'unknown') return 'help-circle-outline' as const;
  if (level === 'high') return 'alert-circle' as const;
  return 'warning-outline' as const;
}

export function RiskBanner({ riskLevel, riskLabel, riskChips }: Props) {
  const colors = useThemeColors();
  const riskColor = getRiskColor(riskLevel, colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={styles.header}>
        <Ionicons name={getRiskIcon(riskLevel)} size={20} color={riskColor} />
        <Text
          style={[
            Typography.bodyBold,
            { color: riskColor, marginLeft: Spacing.sm },
          ]}>
          {riskLabel}
        </Text>
      </View>
      {riskChips.length > 0 && (
        <View style={styles.chips}>
          {riskChips.map((chip) => (
            <View
              key={chip}
              style={[
                styles.chip,
                { backgroundColor: colors.backgroundTertiary },
              ]}>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                {chip}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
});
