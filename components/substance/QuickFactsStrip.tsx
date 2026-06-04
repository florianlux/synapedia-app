import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import { Radius, Typography, Spacing } from '@/constants/theme';
import type { QuickFacts } from '@/types/substance';

interface Props {
  quickFacts: QuickFacts;
}

const COLUMNS: { key: keyof QuickFacts; label: string }[] = [
  { key: 'onset', label: 'Eintritt' },
  { key: 'peak', label: 'Peak' },
  { key: 'duration', label: 'Dauer' },
  { key: 'afterEffects', label: 'Nachklang' },
];

export function QuickFactsStrip({ quickFacts }: Props) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
      {COLUMNS.map((col, index) => (
        <View
          key={col.key}
          style={[
            styles.column,
            index < COLUMNS.length - 1 && {
              borderRightWidth: StyleSheet.hairlineWidth,
              borderRightColor: colors.separator,
            },
          ]}>
          <Text style={[Typography.quickFactLabel, { color: colors.textTertiary }]}>
            {col.label}
          </Text>
          <Text
            style={[
              Typography.quickFactValue,
              { color: colors.textPrimary, marginTop: 2 },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}>
            {quickFacts[col.key]}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: Spacing.page,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
});
