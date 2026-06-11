import type { ComponentProps } from 'react';
import { useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Elevation, Radius, Spacing, Typography, type ThemeColors } from '@/constants/theme';
import {
  useSubstances,
  type LocalSubstanceSummary,
  type SubstanceCatalogPagination,
  type SubstanceSource,
} from '@/hooks/use-substances';
import { useThemeColors } from '@/hooks/use-theme';
import type { RiskLevel } from '@/types/substance';
import { EmptyState, Pill } from '@/components/ui/premium';
import { SourceBadge } from '@/components/ui/SourceBadge';

type WikiSectionKind = 'curated' | 'live' | 'search';

type WikiSection = {
  key: WikiSectionKind;
  title: string;
  subtitle: string;
  source: SubstanceSource;
  data: LocalSubstanceSummary[];
};

const EMPTY_PAGINATION: SubstanceCatalogPagination = {
  available: true,
  hasMore: false,
  page: 0,
  limit: 20,
};

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
  const isSearching = query.trim().length > 0;
  const curated = substancesState.status === 'success' ? substancesState.curated : [];
  const liveCatalog = substancesState.status === 'success' ? substancesState.liveCatalog : [];
  const searchResults = substancesState.status === 'success' ? substancesState.searchResults : [];
  const source = substancesState.status === 'success' ? substancesState.source : 'local';
  const refreshing = substancesState.status === 'success' ? substancesState.refreshing : false;
  const loadingMore = substancesState.status === 'success' ? substancesState.loadingMore : false;
  const liveLoaded = substancesState.status === 'success' ? substancesState.liveLoaded : 0;
  const liveTotal = substancesState.status === 'success' ? substancesState.liveTotal : undefined;
  const errorMessage = substancesState.status === 'success' ? substancesState.errorMessage : undefined;
  const pagination = substancesState.status === 'success' ? substancesState.pagination : EMPTY_PAGINATION;
  const loadMoreLiveCatalog =
    substancesState.status === 'success' ? substancesState.loadMoreLiveCatalog : undefined;
  const sections: WikiSection[] = isSearching
    ? [
        {
          key: 'search',
          title: 'Suchergebnisse',
          subtitle: 'Live-Suche im Synapedia-Katalog, ergänzt durch lokale Referenzdaten.',
          source,
          data: searchResults,
        },
      ]
    : [
        {
          key: 'curated',
          title: 'Schnellzugriff',
          subtitle: 'Kuratierte Top-Profile mit stabiler Reihenfolge.',
          source: 'local',
          data: curated,
        },
        {
          key: 'live',
          title: 'Live-Katalog',
          subtitle: liveCatalog.length > 0
            ? `Seite ${pagination.page}${pagination.totalPages ? ` von ${pagination.totalPages}` : ''} aus dem Live-Katalog.`
            : 'Live-Vorschau wird geladen oder ist gerade nicht erreichbar.',
          source,
          data: liveCatalog,
        },
      ];
  const statusText = isSearching
    ? `${searchResults.length} Treffer · Live-Suche`
    : liveTotal
      ? `${curated.length} kuratiert · ${liveLoaded} von ${liveTotal} live geladen`
      : `${curated.length} kuratiert · ${liveLoaded} live geladen`;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + Spacing.screenBottom + Spacing.lg },
        ]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={[Typography.heroTitle, { color: colors.textPrimary }]}>Wiki</Text>
              <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
                Substanzprofile durchsuchen, vergleichen und als Harm-Reduction-Kontext nutzen.
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
                <Pressable onPress={() => setQuery('')} hitSlop={8} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                </Pressable>
              )}
            </View>

            <View style={styles.resultHeader}>
              <Text style={[Typography.captionBold, { color: colors.textSecondary }]}>
                {statusText}
              </Text>
              <SourceBadge source={source} refreshing={refreshing} />
            </View>

            <View style={[styles.catalogNote, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <Ionicons name="cloud-outline" size={16} color={colors.accent} />
              <Text style={[Typography.caption, styles.catalogNoteText, { color: colors.textSecondary }]}>
                {errorMessage ?? 'Suche durchsucht den Live-Katalog.'}
              </Text>
            </View>
          </>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleBlock}>
              <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]}>
                {section.title}
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                {section.subtitle}
              </Text>
            </View>
            <SourceBadge source={section.source} refreshing={refreshing && section.key !== 'curated'} />
          </View>
        )}
        renderSectionFooter={({ section }) => {
          if (section.key === 'search' && searchResults.length === 0 && !refreshing) {
            return (
              <CatalogStatusCard
                icon={errorMessage ? 'cloud-offline-outline' : 'search-outline'}
                title="Keine Treffer"
                body={errorMessage ?? 'Passe Suche, Alias oder Substanzklasse an.'}
              />
            );
          }

          if (section.key !== 'live') return null;

          if (liveCatalog.length === 0 && refreshing) {
            return (
              <CatalogStatusCard
                icon="cloud-download-outline"
                title="Live-Katalog lädt"
                body="Die erste Katalogseite wird geladen. Schnellzugriff bleibt nutzbar."
                loading
              />
            );
          }

          if (liveCatalog.length === 0 && errorMessage) {
            return (
              <CatalogStatusCard
                icon="cloud-offline-outline"
                title="Live-Katalog nicht erreichbar"
                body="Lokale Profile bleiben sichtbar. Versuche es spaeter erneut oder nutze die Suche lokal."
              />
            );
          }

          if (!pagination.hasMore || !loadMoreLiveCatalog) return null;

          return (
            <LoadMoreButton
              loading={loadingMore}
              onPress={loadMoreLiveCatalog}
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="library-outline"
            title="Keine Treffer"
            body="Passe die Suche nach Name, Alias oder Substanzklasse an."
          />
        }
        renderItem={({ item }) => <SubstanceCard item={item} />}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

function CatalogStatusCard({
  icon,
  title,
  body,
  loading,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
  loading?: boolean;
}) {
  const colors = useThemeColors();

  return (
    <View style={[styles.statusCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.accent} />
      ) : (
        <Ionicons name={icon} size={19} color={colors.textTertiary} />
      )}
      <View style={styles.statusText}>
        <Text style={[Typography.captionBold, { color: colors.textPrimary }]}>
          {title}
        </Text>
        <Text style={[Typography.caption, { color: colors.textSecondary }]}>
          {body}
        </Text>
      </View>
    </View>
  );
}

function LoadMoreButton({
  loading,
  onPress,
}: {
  loading: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();

  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.loadMoreButton,
        {
          backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundSecondary,
          borderColor: colors.border,
          opacity: loading ? 0.72 : 1,
        },
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.accent} />
      ) : (
        <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
      )}
      <Text style={[Typography.bodyBold, { color: colors.accent }]}>
        {loading ? 'Lädt weitere…' : 'Weitere laden'}
      </Text>
    </Pressable>
  );
}

function isChemicalAlias(value: string): boolean {
  const compact = value.replace(/\s+/g, '');
  if (/^\d{2,7}-\d{2}-\d$/.test(compact)) return true;
  if (/^\([0-9A-Z,+-]+\)-/i.test(compact)) return true;
  if ((compact.match(/\d/g)?.length ?? 0) >= 5 && /[()[\]]/.test(compact)) return true;
  if ((compact.match(/\d/g)?.length ?? 0) >= 6 && /^[A-Z0-9-]+$/i.test(compact)) return true;
  return compact.length > 32 && /[A-Z][a-z]?[0-9]/.test(compact);
}

function visibleAliases(aliases?: string[]): string[] {
  return (aliases ?? [])
    .map((alias) => alias.trim())
    .filter((alias) => alias.length > 0 && !isChemicalAlias(alias))
    .slice(0, 3);
}

function SubstanceCard({ item }: { item: LocalSubstanceSummary }) {
  const colors = useThemeColors();
  const riskColor = getRiskColor(item.riskLevel, colors);
  const aliases = visibleAliases(item.aliases);
  const primaryClass = item.primaryClass ?? item.categories[0] ?? 'Substanz';
  const summary = item.summary || 'Noch keine mobile Zusammenfassung verfuegbar.';
  const duration = item.quickFacts?.duration || 'Dauer unbekannt';

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/substance/[slug]',
          params: {
            slug: item.slug,
            name: item.name,
            primaryClass,
            summary,
            duration,
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
            {primaryClass}
          </Text>
        </View>
        <Pill label={item.riskLabel} tint={riskColor} icon="pulse-outline" />
      </View>

      <Text
        style={[Typography.body, styles.summary, { color: colors.textSecondary }]}
        numberOfLines={3}>
        {summary}
      </Text>

      <View style={styles.metaRow}>
        <Pill label={duration} icon="time-outline" />
        {aliases.length > 0 && (
          <Text style={[Typography.caption, styles.aliases, { color: colors.textTertiary }]} numberOfLines={1}>
            Aliasse: {aliases.join(', ')}
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
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  searchBar: {
    minHeight: 44,
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
  clearButton: {
    width: 44,
    height: 44,
    marginRight: -Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
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
  catalogNote: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.lg,
  },
  catalogNoteText: {
    flex: 1,
  },
  sectionHeader: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  sectionTitleBlock: {
    flex: 1,
    gap: Spacing.xs,
  },
  loadMoreButton: {
    minHeight: 44,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  statusCard: {
    minHeight: 64,
    marginBottom: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  statusText: {
    flex: 1,
    gap: 2,
  },
  card: {
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
    ...Elevation.subtle,
    marginBottom: Spacing.sm,
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
    minHeight: 0,
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
