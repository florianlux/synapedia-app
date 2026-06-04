import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useThemeColors } from '@/hooks/use-theme';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { SUBSTANCE_NAME_MAP, SUBSTANCE_LIST } from '@/constants/interactions';
import { SeverityBadge } from './SeverityBadge';
import type { InteractionDetail, EvidenceLevel } from '@/types/interaction';

interface Props {
  interaction: InteractionDetail;
}

// ---------------------------------------------------------------------------
// Evidence helpers
// ---------------------------------------------------------------------------

function getEvidenceLabel(level: EvidenceLevel): string {
  const map: Record<EvidenceLevel, string> = {
    strong: 'Gut belegt',
    moderate: 'Moderate Evidenz',
    limited: 'Begrenzte Datenlage',
    anecdotal: 'Anekdotisch',
  };
  return map[level];
}

function getEvidenceColor(level: EvidenceLevel, colors: { effectPositive: string; severityRisky: string; textTertiary: string }): string {
  if (level === 'strong') return colors.effectPositive;
  if (level === 'moderate') return colors.severityRisky;
  return colors.textTertiary;
}

function getEvidenceIcon(level: EvidenceLevel) {
  if (level === 'strong') return 'shield-checkmark-outline' as const;
  if (level === 'moderate') return 'document-text-outline' as const;
  return 'help-circle-outline' as const;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InteractionResultCard({ interaction }: Props) {
  const colors = useThemeColors();

  const nameA = SUBSTANCE_NAME_MAP[interaction.substanceA] ?? interaction.substanceA;
  const nameB = SUBSTANCE_NAME_MAP[interaction.substanceB] ?? interaction.substanceB;
  // Any substance in our known list gets a detail link
  const knownSlugs = new Set(SUBSTANCE_LIST.map((s) => s.slug));
  const hasDetailA = knownSlugs.has(interaction.substanceA);
  const hasDetailB = knownSlugs.has(interaction.substanceB);
  const evidenceColor = getEvidenceColor(interaction.evidence, colors);

  return (
    <View style={styles.container}>
      {/* ── 1. Severity + Summary ── */}
      <SeverityBadge
        severity={interaction.severity}
        summary={interaction.summary}
      />

      {/* ── 2. Mechanisms (WHY) ── */}
      <View style={styles.section}>
        <Text
          style={[
            Typography.captionBold,
            styles.sectionLabel,
            { color: colors.textSecondary },
          ]}>
          WARUM?
        </Text>
        {interaction.mechanisms.map((m, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={[styles.bullet, { color: colors.textTertiary }]}>
              •
            </Text>
            <Text
              style={[
                Typography.body,
                { color: colors.textPrimary, flex: 1 },
              ]}>
              {m}
            </Text>
          </View>
        ))}
      </View>

      {/* ── 3. Risk factors (WHEN) ── */}
      <View
        style={[
          styles.section,
          styles.riskSection,
          { backgroundColor: colors.backgroundSecondary },
        ]}>
        <Text
          style={[
            Typography.captionBold,
            styles.sectionLabel,
            { color: colors.textSecondary },
          ]}>
          BESONDERS KRITISCH BEI
        </Text>
        {interaction.riskFactors.map((f, i) => (
          <View key={i} style={styles.riskRow}>
            <Ionicons
              name="flash"
              size={14}
              color={colors.severityRisky}
            />
            <Text
              style={[
                Typography.body,
                { color: colors.textPrimary, flex: 1, marginLeft: Spacing.sm },
              ]}>
              {f}
            </Text>
          </View>
        ))}
      </View>

      {/* ── 4. Evidence ── */}
      <View style={styles.evidenceRow}>
        <Ionicons
          name={getEvidenceIcon(interaction.evidence)}
          size={18}
          color={evidenceColor}
        />
        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
          <Text style={[Typography.bodyBold, { color: evidenceColor }]}>
            {getEvidenceLabel(interaction.evidence)}
          </Text>
          <Text
            style={[
              Typography.caption,
              { color: colors.textSecondary, marginTop: 2 },
            ]}>
            {interaction.evidenceNote}
          </Text>
        </View>
      </View>

      {/* ── 5. CTAs ── */}
      {(hasDetailA || hasDetailB) && (
        <View style={[styles.ctaSection, { borderTopColor: colors.separator }]}>
          {hasDetailA && (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/substance/[slug]',
                  params: { slug: interaction.substanceA },
                })
              }
              style={({ pressed }) => [
                styles.ctaButton,
                {
                  backgroundColor: pressed
                    ? colors.backgroundTertiary
                    : colors.backgroundSecondary,
                },
              ]}>
              <Text style={[Typography.bodyBold, { color: colors.accent }]}>
                Mehr über {nameA}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.accent}
              />
            </Pressable>
          )}
          {hasDetailB && (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/substance/[slug]',
                  params: { slug: interaction.substanceB },
                })
              }
              style={({ pressed }) => [
                styles.ctaButton,
                {
                  backgroundColor: pressed
                    ? colors.backgroundTertiary
                    : colors.backgroundSecondary,
                },
              ]}>
              <Text style={[Typography.bodyBold, { color: colors.accent }]}>
                Mehr über {nameB}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.accent}
              />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  bullet: {
    fontSize: 15,
    lineHeight: 22,
    width: 12,
  },
  riskSection: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ctaSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
});
