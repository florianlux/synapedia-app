import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Elevation, Radius, Spacing, Typography, type ThemeColors } from '@/constants/theme';
import { useSubstances, type LocalSubstanceSummary } from '@/hooks/use-substances';
import { useThemeColors } from '@/hooks/use-theme';
import type { RiskLevel } from '@/types/substance';
import { EmptyState, Pill } from '@/components/ui/premium';
import { SourceBadge } from '@/components/ui/SourceBadge';

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
  const source = substancesState.status === 'success' ? substancesState.source : 'local';
  const refreshing = substancesState.status === 'success' ? substancesState.refreshing : false;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <FlatList
        data={substances}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={styles.list}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={[Typography.heroTitle, { color: colors.textPrimary }]}>Wiki</Text>
              <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
                Lokale Substanzprofile durchsuchen, vergleichen und als Harm-Reduction-Kontext
                nutzen.
              </Text>
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
                placeholder="Name, Alias oder Klasse suchen..."
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

            <View style={styles.resultHeader}>
              <Text style={[Typography.captionBold, { color: colors.textSecondary }]}>
                {substances.length} Profile
              </Text>
              <SourceBadge source={source} refreshing={refreshing} />
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="library-outline"
            title="Keine Treffer"
            body="Passe die Suche nach Name, Alias oder Substanzklasse an."
          />
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
      onPress={() =>
        router.push({
          pathname: '/substance/[slug]',
          params: {
            slug: item.slug,
            name: item.name,
            primaryClass: item.primaryClass ?? item.categories[0] ?? '',
            summary: item.summary ?? '',
            duration: item.quickFacts.duration,
            riskLevel: item.riskLevel,
            riskLabel: item.riskLabel,
          },
        })
      }
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundElevated,
          borderColor: colors.cardBorder,
          shadowColor: colors.accent,
        },
      ]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleBlock}>
          <Text style={[Typography.sectionTitle, styles.cardTitle, { color: colors.textPrimary }]}>
            {item.name}
          </Text>
          <Text style={[Typography.caption, { color: colors.textSecondary }]}>
            {item.primaryClass ?? item.categories[0] ?? 'Substanz'}
          </Text>
        </View>
        <Pill label={item.riskLabel} tint={riskColor} icon="pulse-outline" />
      </View>

      <Text style={[Typography.body, styles.summary, { color: colors.textSecondary }]}>
        {item.summary}
      </Text>

      <View style={styles.metaRow}>
        <Pill label={item.quickFacts.duration} icon="time-outline" />
        {item.aliases && item.aliases.length > 0 && (
          <Text style={[Typography.caption, styles.aliases, { color: colors.textTertiary }]} numberOfLines={1}>
            Aliasse: {item.aliases.slice(0, 3).join(', ')}
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
  list: {
    padding: Spacing.page,
    paddingBottom: Spacing.screenBottom,
    gap: Spacing.sm,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  searchBar: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    padding: 0,
  },
  resultHeader: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
    ...Elevation.subtle,
  },
  cardHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  cardTitleBlock: {
    flex: 1,
  },
  cardTitle: {
    marginBottom: 2,
  },
  summary: {
    marginRight: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  aliases: {
    maxWidth: '100%',
  },
});
