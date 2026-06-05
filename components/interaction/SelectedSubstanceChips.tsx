import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useThemeColors } from '@/hooks/use-theme';
import { Elevation, Typography, Spacing, Radius } from '@/constants/theme';
import { SUBSTANCE_NAME_MAP, SUBSTANCE_LIST } from '@/constants/interactions';

interface Props {
  selected: [string | null, string | null];
  onAdd: (slotIndex: number) => void;
  onRemove: (slotIndex: number) => void;
}

function SlotCard({
  slug,
  onPress,
  onRemove,
}: {
  slug: string | null;
  onPress: () => void;
  onRemove: () => void;
}) {
  const colors = useThemeColors();

  // ── Empty slot ──
  if (!slug) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.slot,
          styles.emptySlot,
          {
            borderColor: pressed ? colors.accent : colors.separator,
            backgroundColor: pressed
              ? colors.accentLight
              : colors.backgroundElevated,
          },
        ]}>
        <Ionicons name="add" size={24} color={colors.accent} />
        <Text
          style={[
            Typography.caption,
            { color: colors.accent, marginTop: Spacing.xs },
          ]}>
          Substanz wählen
        </Text>
      </Pressable>
    );
  }

  // ── Filled slot ──
  const name = SUBSTANCE_NAME_MAP[slug] ?? slug;
  const substance = SUBSTANCE_LIST.find((s) => s.slug === slug);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.slot,
        styles.filledSlot,
        { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder },
      ]}>
      <View style={styles.filledHeader}>
        <Text
          style={[Typography.bodyBold, { color: colors.textPrimary, flex: 1 }]}
          numberOfLines={1}>
          {name}
        </Text>
        <Pressable onPress={onRemove} hitSlop={6}>
          <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
        </Pressable>
      </View>
      {substance && (
        <Text
          style={[Typography.caption, { color: colors.textSecondary }]}
          numberOfLines={1}>
          {substance.categories.join(' · ')}
        </Text>
      )}
    </Pressable>
  );
}

export function SelectedSubstanceChips({ selected, onAdd, onRemove }: Props) {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const shouldStack = width < 390;

  return (
    <View style={[styles.container, shouldStack && styles.containerStacked]}>
      <SlotCard
        slug={selected[0]}
        onPress={() => onAdd(0)}
        onRemove={() => onRemove(0)}
      />

      {/* Connector */}
      <View style={[styles.connector, shouldStack && styles.connectorStacked]}>
        <Text
          style={[
            Typography.sectionTitle,
            { color: colors.textTertiary },
          ]}>
          +
        </Text>
      </View>

      <SlotCard
        slug={selected[1]}
        onPress={() => onAdd(1)}
        onRemove={() => onRemove(1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.page,
    gap: Spacing.sm,
  },
  containerStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  connector: {
    width: 28,
    alignItems: 'center',
  },
  connectorStacked: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
  },
  slot: {
    flex: 1,
    minHeight: 64,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  emptySlot: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  filledSlot: {
    borderWidth: StyleSheet.hairlineWidth,
    ...Elevation.subtle,
  },
  filledHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
