import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { SUBSTANCE_LIST } from '@/constants/interactions';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

export default function WikiScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return SUBSTANCE_LIST;

    return SUBSTANCE_LIST.filter((substance) => {
      const haystack = [substance.name, substance.slug, ...substance.categories]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [query]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[Typography.heroTitle, { color: colors.textPrimary }]}>Drug Wiki</Text>
        <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
          Searchable substance cards for the native Synapedia wiki.
        </Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary }]}>
        <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search substances"
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
        data={filtered}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={styles.list}
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="library-outline" size={34} color={colors.textTertiary} />
            <Text style={[Typography.body, styles.emptyText, { color: colors.textSecondary }]}>
              No example substances found.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({ pathname: '/substance/[slug]', params: { slug: item.slug } })
            }
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundSecondary,
              },
            ]}>
            <View style={styles.cardContent}>
              <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>
                {item.name}
              </Text>
              <View style={styles.tagRow}>
                {item.categories.map((category) => (
                  <View
                    key={category}
                    style={[styles.tag, { backgroundColor: colors.backgroundTertiary }]}>
                    <Text style={[Typography.chip, { color: colors.textSecondary }]}>
                      {category}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Pressable>
        )}
      />
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
  },
  cardContent: {
    flex: 1,
    gap: Spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
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
