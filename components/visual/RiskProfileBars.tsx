import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, Typography, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import type { RiskLevel, Substance } from '@/types/substance';

type Dimension = {
  label: string;
  value: number;
};

type Props = {
  substance: Substance;
};

function baseRisk(level: RiskLevel): number {
  const map: Record<RiskLevel, number> = {
    low: 2,
    moderate: 3,
    high: 4,
    extreme: 5,
    unknown: 2,
  };
  return map[level];
}

function clamp(value: number): number {
  return Math.max(1, Math.min(5, value));
}

function getAccent(value: number, colors: ThemeColors): string {
  if (value >= 5) return colors.riskExtreme;
  if (value >= 4) return colors.riskHigh;
  if (value >= 3) return colors.riskModerate;
  return colors.riskLow;
}

function dimensionsFor(substance: Substance): Dimension[] {
  const base = baseRisk(substance.riskLevel);
  const haystack = [
    substance.primaryClass,
    ...substance.categories,
    ...substance.riskChips,
    ...(substance.summary ? [substance.summary] : []),
  ]
    .join(' ')
    .toLowerCase();

  const dependenceBias =
    haystack.includes('opioid') ||
    haystack.includes('benzodiazep') ||
    haystack.includes('phenibut') ||
    haystack.includes('alkohol') ||
    haystack.includes('stimulans')
      ? 1
      : 0;

  const physicalBias =
    haystack.includes('stimulans') ||
    haystack.includes('opioid') ||
    haystack.includes('alkohol') ||
    haystack.includes('dissozi')
      ? 1
      : 0;

  const psychologicalBias =
    haystack.includes('psychedel') ||
    haystack.includes('cannabinoid') ||
    haystack.includes('halluz')
      ? 1
      : 0;

  return [
    { label: 'Akut', value: clamp(base) },
    { label: 'Interaktionen', value: clamp(Math.max(base, substance.interactions.length > 1 ? base + 1 : base)) },
    { label: 'Abhängigkeit', value: clamp(base - 1 + dependenceBias) },
    { label: 'Körperlich', value: clamp(base - 1 + physicalBias) },
    { label: 'Psychisch', value: clamp(base - 1 + psychologicalBias) },
  ];
}

export function RiskProfileBars({ substance }: Props) {
  const colors = useThemeColors();
  const dimensions = dimensionsFor(substance);

  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
      <View style={styles.header}>
        <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>Risikoprofil</Text>
        <Text style={[Typography.quickFactLabel, { color: colors.textTertiary }]}>orientierend</Text>
      </View>
      <View style={styles.rows}>
        {dimensions.map((dimension) => {
          const accent = getAccent(dimension.value, colors);
          return (
            <View key={dimension.label} style={styles.row}>
              <Text style={[Typography.captionBold, styles.label, { color: colors.textSecondary }]}>
                {dimension.label}
              </Text>
              <View style={[styles.track, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                <View
                  style={[
                    styles.fill,
                    { width: `${dimension.value * 20}%`, backgroundColor: accent, shadowColor: accent },
                  ]}
                />
              </View>
              <Text style={[Typography.quickFactLabel, styles.value, { color: colors.textTertiary }]}>
                {dimension.value}/5
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.page,
    marginTop: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  rows: {
    gap: Spacing.sm,
  },
  row: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  label: {
    width: 96,
  },
  track: {
    flex: 1,
    height: 7,
    borderRadius: Radius.full,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
    shadowOpacity: 0.32,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  value: {
    width: 28,
    textAlign: 'right',
  },
});
