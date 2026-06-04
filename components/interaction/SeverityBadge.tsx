import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useThemeColors } from '@/hooks/use-theme';
import { Typography, Spacing, Radius } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import type { InteractionSeverity } from '@/types/substance';

interface Props {
  severity: InteractionSeverity;
  summary: string;
}

function getSeverityColor(s: InteractionSeverity, c: ThemeColors): string {
  const map: Record<InteractionSeverity, string> = {
    lethal: c.severityLethal,
    dangerous: c.severityDangerous,
    risky: c.severityRisky,
    caution: c.severityCaution,
    'low-risk': c.severityLowRisk,
  };
  return map[s];
}

function getSeverityLabel(s: InteractionSeverity): string {
  const map: Record<InteractionSeverity, string> = {
    lethal: 'Lebensbedrohlich',
    dangerous: 'Gefährlich',
    risky: 'Riskant',
    caution: 'Vorsicht',
    'low-risk': 'Geringes Risiko',
  };
  return map[s];
}

function getSeverityIcon(s: InteractionSeverity) {
  if (s === 'lethal') return 'skull-outline' as const;
  if (s === 'dangerous') return 'alert-circle' as const;
  if (s === 'risky') return 'warning-outline' as const;
  if (s === 'caution') return 'information-circle-outline' as const;
  return 'checkmark-circle-outline' as const;
}

function getSeverityBg(s: InteractionSeverity): string {
  const map: Record<InteractionSeverity, string> = {
    lethal: 'rgba(175,26,45,0.10)',
    dangerous: 'rgba(255,59,48,0.10)',
    risky: 'rgba(255,149,0,0.10)',
    caution: 'rgba(255,204,0,0.10)',
    'low-risk': 'rgba(52,199,89,0.10)',
  };
  return map[s];
}

export function SeverityBadge({ severity, summary }: Props) {
  const colors = useThemeColors();
  const severityColor = getSeverityColor(severity, colors);

  return (
    <View style={[styles.container, { backgroundColor: getSeverityBg(severity) }]}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: severityColor }]}>
          <Ionicons name={getSeverityIcon(severity)} size={20} color="#FFFFFF" />
        </View>
        <Text style={[Typography.sectionTitle, { color: severityColor }]}>
          {getSeverityLabel(severity)}
        </Text>
      </View>
      <Text
        style={[
          Typography.body,
          { color: colors.textPrimary, marginTop: Spacing.sm },
        ]}>
        {summary}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
