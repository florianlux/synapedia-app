import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { router, type Href } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { POPULAR_GRAPH_SUBSTANCES } from '@/features/graph/fallback';
import { buildGraphFocusPath, normalizeGraphFocus } from '@/features/graph/navigation';
import { useThemeColors } from '@/hooks/use-theme';
import { Radius, Spacing, Typography } from '@/constants/theme';
import {
  DisclaimerCard,
  PremiumCard,
  Screen,
  SectionHeader,
} from '@/components/ui/premium';

type IconName = ComponentProps<typeof Ionicons>['name'];

const FEATURE_CARDS: {
  title: string;
  body: string;
  icon: IconName;
  focus: string;
  safetyMode?: boolean;
}[] = [
  {
    title: 'Substanz-Netzwerk',
    body: 'Verwandte Substanzen, Rezeptoren und Effekte entdecken.',
    icon: 'git-network-outline',
    focus: 's:mdma',
  },
  {
    title: 'Safety Mode',
    body: 'Kritische Interaktionen fokussieren.',
    icon: 'shield-checkmark-outline',
    focus: 's:mdma',
    safetyMode: true,
  },
  {
    title: 'Mechanismen',
    body: 'Wirkweisen und Rezeptorbezüge sichtbar machen.',
    icon: 'pulse-outline',
    focus: 'm:serotonin',
  },
];

const DISCLAIMER = 'Graphdaten dienen der Orientierung und ersetzen keine medizinische Beratung.';

export default function GraphScreen() {
  const colors = useThemeColors();
  const [query, setQuery] = useState('');
  const [safetyMode, setSafetyMode] = useState(false);

  function openFocus(focus: string, forceSafetyMode = safetyMode) {
    const href = buildGraphFocusPath(focus, { safetyMode: forceSafetyMode });
    if (href) router.push(href as unknown as Href);
  }

  function submitSearch() {
    const focus = normalizeGraphFocus(`q:${query}`);
    if (focus) openFocus(focus);
  }

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: colors.accentLight }]}>
          <Ionicons name="git-network-outline" size={24} color={colors.accent} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={[Typography.heroTitle, styles.title, { color: colors.textPrimary }]}>
            Wissensgraph
          </Text>
          <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
            Substanzen, Rezeptoren, Wirkmechanismen und Interaktionen visuell erkunden.
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder },
        ]}>
        <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={submitSearch}
          placeholder="Substanz, Rezeptor oder Effekt suchen..."
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={[Typography.body, styles.searchInput, { color: colors.textPrimary }]}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
          </Pressable>
        )}
      </View>

      <View style={[styles.safetyRow, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
        <View style={styles.safetyCopy}>
          <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>Safety Mode</Text>
          <Text style={[Typography.caption, { color: colors.textSecondary }]}>
            High-/Critical-Interaktionen im Fokus.
          </Text>
        </View>
        <Switch
          value={safetyMode}
          onValueChange={setSafetyMode}
          trackColor={{ false: colors.backgroundTertiary, true: `${colors.riskHigh}88` }}
          thumbColor={safetyMode ? colors.riskHigh : colors.textTertiary}
        />
      </View>

      <SectionHeader
        title="Beliebte Einstiege"
        subtitle="Ein Tap öffnet die native Focus-Preview."
      />
      <View style={styles.chipGrid}>
        {POPULAR_GRAPH_SUBSTANCES.map((item) => (
          <Pressable
            key={item.slug}
            onPress={() => openFocus(`s:${item.slug}`)}
            accessibilityRole="button"
            accessibilityLabel={`${item.label} im Graph anzeigen`}
            style={({ pressed }) => [
              styles.popularChip,
              {
                backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundElevated,
                borderColor: pressed ? `${colors.accent}55` : colors.cardBorder,
              },
            ]}>
            <Text style={[Typography.chip, { color: colors.textPrimary }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader
        title="Graph-Modi"
        subtitle="Foundation-Preview für den nächsten Renderer-Sprint."
      />
      <View style={styles.featureList}>
        {FEATURE_CARDS.map((card) => (
          <Pressable
            key={card.title}
            onPress={() => openFocus(card.focus, card.safetyMode ?? safetyMode)}
            accessibilityRole="button"
            accessibilityLabel={card.title}>
            {({ pressed }) => (
              <PremiumCard pressed={pressed} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: colors.accentLight }]}>
                  <Ionicons name={card.icon} size={21} color={colors.accent} />
                </View>
                <View style={styles.featureCopy}>
                  <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>
                    {card.title}
                  </Text>
                  <Text style={[Typography.caption, styles.featureBody, { color: colors.textSecondary }]}>
                    {card.body}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </PremiumCard>
            )}
          </Pressable>
        ))}
      </View>

      <DisclaimerCard text={DISCLAIMER} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  searchBar: {
    minHeight: 48,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
  },
  safetyRow: {
    minHeight: 58,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  safetyCopy: {
    flex: 1,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  popularChip: {
    minHeight: 36,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureList: {
    gap: Spacing.sm,
  },
  featureCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCopy: {
    flex: 1,
  },
  featureBody: {
    marginTop: 2,
  },
});
