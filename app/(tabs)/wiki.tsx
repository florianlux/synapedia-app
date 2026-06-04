import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Radius, Spacing, Typography, type ThemeColors } from '@/constants/theme';
import { useSubstances, type LocalSubstanceSummary } from '@/hooks/use-substances';
import { useThemeColors } from '@/hooks/use-theme';
import type { RiskLevel } from '@/types/substance';

function getRiskColor(level: RiskLevel, colors: ThemeColors): string {
  const map: Record<RiskLevel, string> = {
    low: colors.riskLow,
    moderate: colors.riskModerate,
    high: colors.riskHigh,
    extreme: colors.riskExtreme,
    unknown: colors.riskUnknown,
  };
  return map[level];
}

export default function WikiScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const substancesState = useSubstances(query);
  const substances = substancesState.status === 'success' ? substancesState.data : [];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[Typography.heroTitle, { color: colors.textPrimary }]}>Drug Wiki</Text>
        <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
          Search by substance, alias, or class.
        </Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary }]}>
        <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search MDMA, Valium, opioid..."
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

      <FlatList
        data={substances}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={styles.list}
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="library-outline" size={34} color={colors.textTertiary} />
            <Text style={[Typography.body, styles.emptyText, { color: colors.textSecondary }]}>
              No substances match that search.
            </Text>
          </View>
        }
        renderItem={({ item }) => <SubstanceCard item={item} />}
      />
    </View>
  );
}

function SubstanceCard({ item }: { item: LocalSubstanceSummary }) {
  const colors = useThemeColors();
  const riskColor = getRiskColor(item.riskLevel, colors);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/substance/[slug]', params: { slug: item.slug } })}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundSecondary,
        },
      ]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleBlock}>
          <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>{item.name}</Text>
          <Text style={[Typography.caption, { color: colors.textSecondary }]}>
            {item.primaryClass ?? item.categories[0] ?? 'Substance'}
          </Text>
        </View>
        <View style={[styles.riskPill, { backgroundColor: `${riskColor}20` }]}>
          <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
          <Text style={[Typography.chip, { color: riskColor }]}>{item.riskLabel}</Text>
        </View>
      </View>

      <Text style={[Typography.caption, styles.summary, { color: colors.textSecondary }]}>
        {item.summary}
      </Text>

      <View style={styles.metaRow}>
        <View style={[styles.metaChip, { backgroundColor: colors.backgroundTertiary }]}>
          <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
          <Text style={[Typography.chip, { color: colors.textSecondary }]}>
            {item.quickFacts.duration}
          </Text>
        </View>
        {item.aliases && item.aliases.length > 0 && (
          <Text style={[Typography.caption, styles.aliases, { color: colors.textTertiary }]} numberOfLines={1}>
            Also: {item.aliases.slice(0, 3).join(', ')}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  searchInput: {
    flex: 1,
    padding: 0,
  },
  list: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.sm,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  cardTitleBlock: {
    flex: 1,
  },
  riskPill: {
    minHeight: 30,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  riskDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  summary: {
    marginRight: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  metaChip: {
    minHeight: 30,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  aliases: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
