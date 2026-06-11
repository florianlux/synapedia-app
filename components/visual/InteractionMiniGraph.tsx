import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, Typography, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import type { MixCheckRiskLevel } from '@/types/interaction';

type Props = {
  substanceA: string;
  substanceB: string;
  riskLevel: MixCheckRiskLevel;
  riskLabel: string;
  mechanisms: string[];
};

function getRiskColor(level: MixCheckRiskLevel, colors: ThemeColors): string {
  const map: Record<MixCheckRiskLevel, string> = {
    low: colors.severityLowRisk,
    medium: colors.severityCaution,
    high: colors.severityRisky,
    critical: colors.severityDangerous,
    unknown: colors.riskUnknown,
  };
  return map[level];
}

export function compactMechanismLabel(text: string): string {
  const normalized = text.toLowerCase();

  if (normalized.includes('cocaethylen')) return 'Cocaethylen';
  if (normalized.includes('seroton')) return 'Serotonin';
  if (normalized.includes('temperatur') || normalized.includes('überhitz')) return 'Temperatur';
  if (normalized.includes('herz') || normalized.includes('blutdruck') || normalized.includes('puls')) {
    return 'Herz-Kreislauf';
  }
  if (normalized.includes('zns') || normalized.includes('sedierung') || normalized.includes('daempf')) {
    return 'Sedierung';
  }
  if (normalized.includes('angst') || normalized.includes('panik') || normalized.includes('psyche')) {
    return 'Psyche';
  }
  if (normalized.includes('erbrechen') || normalized.includes('aspiration')) return 'Aspiration';
  if (normalized.includes('blackout')) return 'Blackout';

  const words = text.replace(/[.,;:]/g, '').split(/\s+/).filter(Boolean);
  return words.slice(0, 2).join(' ');
}

export function InteractionMiniGraph({
  substanceA,
  substanceB,
  riskLevel,
  riskLabel,
  mechanisms,
}: Props) {
  const colors = useThemeColors();
  const riskColor = getRiskColor(riskLevel, colors);
  const mechanismLabels = Array.from(new Set(mechanisms.map(compactMechanismLabel))).slice(0, 3);

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
      <View pointerEvents="none" style={[styles.glow, { backgroundColor: riskColor }]} />
      <View style={styles.graphRow}>
        <View style={[styles.connector, { backgroundColor: `${riskColor}36` }]} />
        <GraphNode label={substanceA} tint={colors.accent} />
        <View style={[styles.riskNode, { backgroundColor: `${riskColor}10`, borderColor: `${riskColor}32` }]}>
          <Text style={[Typography.quickFactLabel, { color: colors.textTertiary }]}>Risikostufe</Text>
          <Text style={[Typography.captionBold, styles.riskText, { color: riskColor }]} numberOfLines={1}>
            {riskLabel}
          </Text>
        </View>
        <GraphNode label={substanceB} tint={colors.accent} />
      </View>

      {mechanismLabels.length > 0 && (
        <View style={styles.mechanismBlock}>
          <Text style={[Typography.quickFactLabel, { color: colors.textTertiary }]}>Mechanismen</Text>
          <View style={styles.mechanisms}>
            {mechanismLabels.map((label) => (
              <View
                key={label}
                style={[
                  styles.mechanismChip,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                ]}>
                <View style={[styles.mechanismDot, { backgroundColor: riskColor }]} />
                <Text style={[Typography.chip, { color: colors.textSecondary }]} numberOfLines={1}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function GraphNode({ label, tint }: { label: string; tint: string }) {
  const colors = useThemeColors();

  return (
    <View style={[styles.node, { backgroundColor: `${tint}0B`, borderColor: `${tint}30` }]}>
      <Text style={[Typography.captionBold, { color: colors.textPrimary, textAlign: 'center' }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  glow: {
    position: 'absolute',
    right: -38,
    top: -44,
    width: 138,
    height: 112,
    borderRadius: Radius.full,
    opacity: 0.05,
  },
  graphRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  connector: {
    position: 'absolute',
    left: 28,
    right: 28,
    top: 36,
    height: 1,
  },
  node: {
    flex: 1,
    minWidth: 0,
    minHeight: 38,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  riskNode: {
    flex: 1.18,
    minWidth: 0,
    minHeight: 46,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  riskText: {
    marginTop: 2,
  },
  mechanismBlock: {
    gap: Spacing.sm,
  },
  mechanisms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  mechanismChip: {
    minHeight: 30,
    maxWidth: '100%',
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  mechanismDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
