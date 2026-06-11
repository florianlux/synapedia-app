import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useThemeColors } from '@/hooks/use-theme';
import { Typography, Spacing, Radius } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import type { Interaction, InteractionSeverity } from '@/types/substance';

interface Props {
  interactions: Interaction[];
  onOpenMixCheck?: () => void;
}

function getSeverityColor(
  severity: InteractionSeverity,
  colors: ThemeColors,
): string {
  const map: Record<InteractionSeverity, string> = {
    lethal: colors.severityLethal,
    dangerous: colors.severityDangerous,
    risky: colors.severityRisky,
    caution: colors.severityCaution,
    'low-risk': colors.severityLowRisk,
  };
  return map[severity];
}

function getSeverityLabel(severity: InteractionSeverity): string {
  const map: Record<InteractionSeverity, string> = {
    lethal: 'Lebensbedrohlich',
    dangerous: 'Gefährlich',
    risky: 'Riskant',
    caution: 'Vorsicht',
    'low-risk': 'Geringes Risiko',
  };
  return map[severity];
}

const SEVERITY_ORDER: InteractionSeverity[] = [
  'lethal',
  'dangerous',
  'risky',
  'caution',
  'low-risk',
];

export function InteractionsPreviewSection({ interactions, onOpenMixCheck }: Props) {
  const colors = useThemeColors();

  const sorted = [...interactions].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );

  if (sorted.length === 0) {
    return (
      <View
        style={[
          styles.emptyState,
          { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
        ]}>
        <Ionicons name="git-compare-outline" size={22} color={colors.accent} />
        <View style={styles.textContainer}>
          <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>
            Keine Vorschau gespeichert
          </Text>
          <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            Prüfe konkrete Kombinationen im MixCheck.
          </Text>
        </View>
        <Pressable
          onPress={onOpenMixCheck}
          style={({ pressed }) => [
            styles.ctaButton,
            { backgroundColor: pressed ? '#0066D6' : colors.accent },
          ]}>
          <Text style={[Typography.captionBold, { color: '#FFFFFF' }]}>
            Öffnen
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {sorted.map((interaction) => {
        const severityColor = getSeverityColor(interaction.severity, colors);
        return (
          <Pressable
            key={interaction.substance}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: pressed
                  ? colors.backgroundTertiary
                  : colors.backgroundSecondary,
                borderColor: colors.border,
              },
            ]}>
            <View style={[styles.dot, { backgroundColor: severityColor }]} />
            <View style={styles.textContainer}>
              <Text
                style={[Typography.bodyBold, { color: colors.textPrimary }]}>
                {interaction.substance}
              </Text>
              <Text style={[Typography.caption, { color: severityColor }]}>
                {getSeverityLabel(interaction.severity)}
              </Text>
              <Text
                style={[
                  Typography.caption,
                  { color: colors.textSecondary, marginTop: 2 },
                ]}>
                {interaction.description}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textTertiary}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  ctaButton: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
});
