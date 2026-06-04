import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

const NODES = [
  { label: 'MDMA', left: '8%', top: 36, size: 48, tint: '#36A3FF' },
  { label: 'LSD', left: '40%', top: 16, size: 42, tint: '#7AE4FF' },
  { label: 'Risiko', left: '66%', top: 56, size: 52, tint: '#FF5A52' },
] as const;

const LINES = [
  { left: '20%', top: 58, width: '30%', rotate: '-25deg', tint: '#36A3FF' },
  { left: '50%', top: 60, width: '28%', rotate: '31deg', tint: '#FF5A52' },
] as const;

const RELATIONSHIPS = [
  { label: 'Interaktion', tint: '#36A3FF' },
  { label: 'Risiko', tint: '#FFB340' },
] as const;

export function SynapediaGraphCard() {
  const colors = useThemeColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
      <View pointerEvents="none" style={styles.background}>
        <View style={[styles.blueGlow, { backgroundColor: colors.accent }]} />
        <View style={[styles.amberGlow, { backgroundColor: colors.severityRisky }]} />
      </View>

      <View style={styles.header}>
        <View>
          <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>Synapedia Graph</Text>
          <Text style={[Typography.caption, styles.subtitle, { color: colors.textSecondary }]}>
            Substanzen, Risiken und Beziehungen sichtbar machen.
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: `${colors.accent}10`, borderColor: `${colors.accent}24` }]}>
          <View style={[styles.statusDot, { backgroundColor: colors.accent }]} />
          <Text style={[Typography.quickFactLabel, { color: colors.accent }]}>lokal</Text>
        </View>
      </View>

      <View style={styles.canvas}>
        {LINES.map((line, index) => (
          <View
            key={`${line.tint}-${index}`}
            style={[
              styles.line,
              {
                left: line.left,
                top: line.top,
                width: line.width,
                backgroundColor: line.tint,
                transform: [{ rotate: line.rotate }],
              },
            ]}
          />
        ))}

        {NODES.map((node) => (
          <View
            key={node.label}
            style={[
              styles.node,
              {
                left: node.left,
                top: node.top,
                width: node.size,
                height: node.size,
                borderRadius: node.size / 2,
                backgroundColor: `${node.tint}14`,
                borderColor: `${node.tint}75`,
              },
            ]}>
            <View style={[styles.nodeCore, { backgroundColor: `${node.tint}28` }]}>
              <Text
                style={[Typography.quickFactLabel, styles.nodeLabel, { color: node.tint }]}
                numberOfLines={1}
                adjustsFontSizeToFit>
                {node.label}
              </Text>
            </View>
          </View>
        ))}

        <View style={[styles.relationship, styles.relationshipOne, { borderColor: `${colors.severityRisky}55` }]}>
          <Text style={[Typography.quickFactLabel, { color: colors.severityRisky }]}>hoch</Text>
        </View>
        <View style={[styles.relationship, styles.relationshipTwo, { borderColor: `${colors.severityCaution}55` }]}>
          <Text style={[Typography.quickFactLabel, { color: colors.severityCaution }]}>mittel</Text>
        </View>
      </View>

      <View style={styles.relationships}>
        {RELATIONSHIPS.map((item) => (
          <View key={item.label} style={[styles.chip, { backgroundColor: `${item.tint}12`, borderColor: `${item.tint}30` }]}>
            <View style={[styles.chipDot, { backgroundColor: item.tint }]} />
            <Text style={[Typography.chip, { color: item.tint }]} numberOfLines={1}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  blueGlow: {
    position: 'absolute',
    top: -38,
    left: -26,
    width: 180,
    height: 122,
    borderRadius: Radius.full,
    opacity: 0.07,
  },
  amberGlow: {
    position: 'absolute',
    right: -42,
    bottom: 20,
    width: 142,
    height: 112,
    borderRadius: Radius.full,
    opacity: 0.06,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  subtitle: {
    marginTop: Spacing.xs,
    maxWidth: 250,
  },
  statusPill: {
    minHeight: 26,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  canvas: {
    height: 116,
    marginTop: Spacing.sm,
    position: 'relative',
  },
  line: {
    position: 'absolute',
    height: 1,
    opacity: 0.28,
  },
  node: {
    position: 'absolute',
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCore: {
    width: '90%',
    height: '90%',
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  nodeLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  relationship: {
    position: 'absolute',
    minHeight: 22,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(3,4,6,0.62)',
  },
  relationshipOne: {
    right: '18%',
    top: 78,
  },
  relationshipTwo: {
    left: '39%',
    top: 52,
  },
  relationships: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    minHeight: 30,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
