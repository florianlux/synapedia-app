import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

import { useThemeColors } from '@/hooks/use-theme';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useSubstances } from '@/hooks/use-substances';

interface Props {
  visible: boolean;
  onSelect: (slug: string) => void;
  onClose: () => void;
  excludeSlugs?: string[];
}

export function SubstancePicker({
  visible,
  onSelect,
  onClose,
  excludeSlugs = [],
}: Props) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const substancesState = useSubstances(query);

  const data =
    substancesState.status === 'success' ? substancesState.data : [];
  const isLoading = substancesState.status === 'loading';

  function handleClose() {
    setQuery('');
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleClose} />

      {/* Sheet */}
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.background,
            paddingBottom: Math.max(insets.bottom, Spacing.lg),
            borderTopColor: colors.cardBorder,
          },
        ]}>
        {/* Handle */}
        <View style={styles.handleRow}>
          <View
            style={[styles.handle, { backgroundColor: colors.textTertiary }]}
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]}>
            Substanz wählen
          </Text>
          <Pressable onPress={handleClose} hitSlop={8}>
            <Ionicons name="close-circle" size={28} color={colors.textTertiary} />
          </Pressable>
        </View>

        {/* Search input */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder },
          ]}>
          <Ionicons name="search" size={16} color={colors.textTertiary} />
          <TextInput
            style={[
              Typography.body,
              styles.searchInput,
              { color: colors.textPrimary },
            ]}
            placeholder="Substanz suchen…"
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={16}
                color={colors.textTertiary}
              />
            </Pressable>
          )}
        </View>

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        )}

        {/* List */}
        <FlatList
          data={data}
          keyExtractor={(item) => item.slug}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Math.max(insets.bottom, Spacing.lg) + Spacing.lg },
          ]}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            !isLoading ? (
              <Text
                style={[
                  Typography.body,
                  { color: colors.textSecondary, textAlign: 'center', padding: Spacing.xl },
                ]}>
                Keine Substanzen gefunden.
              </Text>
            ) : null
          }
          renderItem={({ item }) => {
            const isDisabled = excludeSlugs.includes(item.slug);
            return (
              <Pressable
                disabled={isDisabled}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setQuery('');
                  onSelect(item.slug);
                }}
                style={({ pressed }) => [
                  styles.row,
                  {
                    backgroundColor: pressed
                      ? colors.backgroundTertiary
                      : colors.backgroundElevated,
                    borderColor: colors.cardBorder,
                    opacity: isDisabled ? 0.4 : 1,
                  },
                ]}>
                <View style={styles.rowContent}>
                  <Text
                    style={[
                      Typography.bodyBold,
                      { color: colors.textPrimary },
                    ]}>
                    {item.name}
                  </Text>
                  {item.categories.length > 0 && (
                    <Text
                      style={[
                        Typography.caption,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={1}>
                      {item.categories.join(' · ')}
                    </Text>
                  )}
                </View>
                {!isDisabled && (
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color={colors.accent}
                  />
                )}
                {isDisabled && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.textTertiary}
                  />
                )}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '82%',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    opacity: 0.4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.page,
    paddingVertical: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.page,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
    borderRadius: Radius.md,
    gap: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
  },
  loadingRow: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: Spacing.page,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowContent: {
    flex: 1,
  },
});
