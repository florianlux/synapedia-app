import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Elevation, Radius, Spacing, Typography, type ThemeColors } from '@/constants/theme';
import { SUBSTANCE_LIST, SUBSTANCE_NAME_MAP } from '@/constants/interactions';
import { useThemeColors } from '@/hooks/use-theme';
import type { InteractionSource } from '@/hooks/use-interaction';
import type { InteractionDetail, MixCheckRiskLevel } from '@/types/interaction';
import { InteractionMiniGraph } from '@/components/visual/InteractionMiniGraph';
import { SourceBadge } from '@/components/ui/SourceBadge';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface Props {
  interaction: InteractionDetail;
  source?: InteractionSource;
  refreshing?: boolean;
}

function getRiskMeta(
  level: MixCheckRiskLevel,
  colors: ThemeColors,
): { label: string; color: string; bg: string; icon: IconName } {
  const map: Record<MixCheckRiskLevel, { label: string; color: string; bg: string; icon: IconName }> = {
    low: {
      label: 'Niedrig',
      color: colors.severityLowRisk,
      bg: 'rgba(48,209,88,0.12)',
      icon: 'checkmark-circle-outline',
    },
    medium: {
      label: 'Mittel',
      color: colors.severityCaution,
      bg: 'rgba(255,214,10,0.12)',
      icon: 'information-circle-outline',
    },
    high: {
      label: 'Hoch',
      color: colors.severityRisky,
      bg: 'rgba(255,159,10,0.12)',
      icon: 'warning-outline',
    },
    critical: {
      label: 'Kritisch',
      color: colors.severityDangerous,
      bg: 'rgba(255,69,58,0.12)',
      icon: 'alert-circle',
    },
    unknown: {
      label: 'Unbekannt',
      color: colors.riskUnknown,
      bg: 'rgba(99,99,102,0.18)',
      icon: 'help-circle-outline',
    },
  };

  return map[level];
}

function Section({
  title,
  icon,
  children,
  danger,
}: {
  title: string;
  icon: IconName;
  children: ReactNode;
  danger?: boolean;
}) {
  const colors = useThemeColors();
  const accent = danger ? colors.severityDangerous : colors.accent;

  return (
    <View style={[styles.section, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={17} color={accent} />
        <Text style={[Typography.captionBold, { color: colors.textSecondary }]}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function BulletList({ items, danger }: { items: string[]; danger?: boolean }) {
  const colors = useThemeColors();
  const dotColor = danger ? colors.severityDangerous : colors.textTertiary;

  return (
    <View style={styles.bulletList}>
      {items.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
          <Text style={[Typography.body, { color: colors.textPrimary, flex: 1 }]}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

function displaySubstanceName(slug: string, fallback: string): string {
  const mapped = SUBSTANCE_NAME_MAP[slug];
  if (mapped) return mapped;

  const cleaned = slug.trim();
  const lower = cleaned.toLowerCase();
  if (!cleaned || lower === 'null' || lower === 'undefined' || lower === '[object object]') {
    return fallback;
  }

  return cleaned
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function InteractionResultCard({ interaction, source, refreshing = false }: Props) {
  const colors = useThemeColors();
  const risk = getRiskMeta(interaction.riskLevel, colors);
  const knownSlugs = new Set(SUBSTANCE_LIST.map((substance) => substance.slug));
  const hasDetailA = knownSlugs.has(interaction.substanceA);
  const hasDetailB = knownSlugs.has(interaction.substanceB);
  const nameA = displaySubstanceName(interaction.substanceA, 'Substanz A');
  const nameB = displaySubstanceName(interaction.substanceB, 'Substanz B');
  const hasEvidence = Boolean(interaction.evidenceNote || interaction.sourceNote);

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { backgroundColor: risk.bg, borderColor: `${risk.color}38`, shadowColor: risk.color }]}>
        <View style={styles.heroTop}>
          <View style={[styles.riskIcon, { backgroundColor: risk.color }]}>
            <Ionicons name={risk.icon} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.heroText}>
            <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]}>
              {interaction.title}
            </Text>
            <Text style={[Typography.bodyBold, { color: risk.color }]}>
              Risikostufe: {risk.label}
            </Text>
          </View>
        </View>
        <Text style={[Typography.body, styles.summary, { color: colors.textPrimary }]}>
          {interaction.summary}
        </Text>
      </View>

      <InteractionMiniGraph
        substanceA={nameA}
        substanceB={nameB}
        riskLevel={interaction.riskLevel}
        riskLabel={risk.label}
        mechanisms={interaction.mechanisms}
      />

      {source && (
        <View style={styles.sourceRow}>
          <SourceBadge source={source} refreshing={refreshing} />
        </View>
      )}

      {interaction.mechanisms.length > 0 && (
        <Section title="Risikomechanismen" icon="git-network-outline">
          <BulletList items={interaction.mechanisms} />
        </Section>
      )}

      {interaction.saferUseNotes.length > 0 && (
        <Section title="Safer-Use-Hinweise" icon="shield-checkmark-outline">
          <BulletList items={interaction.saferUseNotes} />
        </Section>
      )}

      {interaction.redFlags.length > 0 && (
        <Section title="Wann Hilfe holen?" icon="alert-circle-outline" danger>
          <BulletList items={interaction.redFlags} danger />
        </Section>
      )}

      {hasEvidence && (
        <Section title="Evidenz / Quellen" icon="document-text-outline">
          {interaction.evidenceNote && (
            <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>
              {interaction.evidenceNote}
            </Text>
          )}
          {interaction.sourceNote && (
            <Text style={[Typography.caption, styles.sourceText, { color: colors.textSecondary }]}>
              {interaction.sourceNote}
            </Text>
          )}
        </Section>
      )}

      <View style={[styles.disclaimer, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
        <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
        <Text style={[Typography.caption, { color: colors.textSecondary, flex: 1 }]}>
          Informations- und Harm-Reduction-Tool. Keine medizinische Beratung.
        </Text>
      </View>

      {(hasDetailA || hasDetailB) && (
        <View style={[styles.ctaSection, { borderTopColor: colors.separator }]}>
          {hasDetailA && (
            <DetailButton name={nameA} slug={interaction.substanceA} />
          )}
          {hasDetailB && (
            <DetailButton name={nameB} slug={interaction.substanceB} />
          )}
        </View>
      )}
    </View>
  );
}

function DetailButton({ name, slug }: { name: string; slug: string }) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/substance/[slug]', params: { slug } })}
      style={({ pressed }) => [
        styles.ctaButton,
        {
          backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundElevated,
          borderColor: colors.cardBorder,
        },
      ]}>
      <Text style={[Typography.bodyBold, { color: colors.accent }]}>
        Mehr über {name}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={colors.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.page,
    gap: Spacing.lg,
  },
  hero: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    ...Elevation.subtle,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  riskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
  },
  summary: {
    marginTop: Spacing.md,
  },
  section: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bulletList: {
    gap: Spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 8,
  },
  sourceText: {
    marginTop: Spacing.xs,
  },
  sourceRow: {
    alignItems: 'flex-start',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
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
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
