import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import type { QuickFacts } from '@/types/substance';

type Props = {
  quickFacts: QuickFacts;
};

const ITEMS: { key: keyof QuickFacts; label: string }[] = [
  { key: 'onset', label: 'Beginn' },
  { key: 'peak', label: 'Peak' },
  { key: 'duration', label: 'Gesamtdauer' },
  { key: 'afterEffects', label: 'Nachwirkungen' },
];

function hasValue(value: string): boolean {
  return Boolean(value && value !== '—' && value.trim().length > 0);
}

export function DurationTimeline({ quickFacts }: Props) {
  const colors = useThemeColors();
  const items = ITEMS.filter((item) => hasValue(quickFacts[item.key]));

  if (items.length < 2) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
      <View style={styles.header}>
        <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]}>Wirkverlauf</Text>
        <Text style={[Typography.quickFactLabel, { color: colors.textTertiary }]}>lokale Angaben</Text>
      </View>

      <View style={styles.timeline}>
        <View style={[styles.line, { backgroundColor: `${colors.accent}40` }]} />
        {items.map((item) => (
          <View key={item.key} style={styles.point}>
            <View style={[styles.dot, { backgroundColor: colors.backgroundSecondary, borderColor: `${colors.accent}75` }]}>
              <View style={[styles.dotCore, { backgroundColor: colors.accent }]} />
            </View>
            <Text style={[Typography.quickFactLabel, styles.pointLabel, { color: colors.textTertiary }]} numberOfLines={1}>
              {item.label}
            </Text>
            <Text
              style={[Typography.captionBold, styles.pointValue, { color: colors.textPrimary }]}
              numberOfLines={2}>
              {quickFacts[item.key]}
            </Text>
          </View>
        ))}
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
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  timeline: {
    minHeight: 86,
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    gap: Spacing.xs,
  },
  line: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 7,
    height: StyleSheet.hairlineWidth,
  },
  point: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pointLabel: {
    textAlign: 'center',
  },
  pointValue: {
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
