import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import { Typography, Spacing } from '@/constants/theme';
import type { DurationPhase, QuickFacts } from '@/types/substance';

interface Props {
  phases: DurationPhase[];
  total: string;
  quickFacts?: QuickFacts;
  notes?: string[];
}

function hasUsefulValue(value: string | undefined): boolean {
  return !!value && value !== '-' && value !== '—';
}

export function DurationSection({ phases, total, quickFacts, notes = [] }: Props) {
  const colors = useThemeColors();
  const quickFactPhases: DurationPhase[] = quickFacts
    ? [
        { label: 'Eintritt', value: quickFacts.onset },
        { label: 'Peak', value: quickFacts.peak },
        { label: 'Dauer', value: quickFacts.duration },
        { label: 'Nachklang', value: quickFacts.afterEffects },
      ].filter((phase) => hasUsefulValue(phase.value))
    : [];
  const rows = phases.length ? phases : quickFactPhases;
  const totalValue = hasUsefulValue(total) ? total : quickFacts?.duration;

  return (
    <View>
      {rows.map((phase, index) => (
        <View
          key={`${phase.label}-${phase.value}`}
          style={[
            styles.row,
            index < rows.length - 1 && {
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
      {hasUsefulValue(totalValue) && (
        <View style={styles.totalRow}>
          <Text
            style={[Typography.bodyBold, { color: colors.textPrimary, flex: 1 }]}>
            Gesamt
          </Text>
          <Text style={[Typography.bodyBold, { color: colors.accent }]}>
            {totalValue}
          </Text>
        </View>
      )}
      {notes.length > 0 && (
        <View style={styles.notes}>
          {notes.map((note) => (
            <Text key={note} style={[Typography.caption, { color: colors.textTertiary }]}>
              {note}
            </Text>
          ))}
        </View>
      )}
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
  notes: {
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
});
