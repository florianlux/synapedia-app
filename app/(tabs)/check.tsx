import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useThemeColors } from '@/hooks/use-theme';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { POPULAR_INTERACTION_PAIRS } from '@/constants/interactions';
import { useInteraction } from '@/hooks/use-interaction';
import { SubstancePicker } from '@/components/interaction/SubstancePicker';
import { SelectedSubstanceChips } from '@/components/interaction/SelectedSubstanceChips';
import { InteractionResultCard } from '@/components/interaction/InteractionResultCard';

type Selected = [string | null, string | null];

export default function CheckScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [selected, setSelected] = useState<Selected>([null, null]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerSlot, setPickerSlot] = useState<0 | 1>(0);

  // ---- Derived state ----
  const filledCount = selected.filter(Boolean).length;
  const interactionState = useInteraction(selected[0], selected[1]);

  // ---- Handlers ----
  const openPicker = useCallback((slot: number) => {
    setPickerSlot(slot as 0 | 1);
    setPickerVisible(true);
  }, []);

  const handleSelect = useCallback(
    (slug: string) => {
      setSelected((prev) => {
        const next: Selected = [...prev] as Selected;
        next[pickerSlot] = slug;
        return next;
      });
      setPickerVisible(false);
    },
    [pickerSlot],
  );

  const handleRemove = useCallback((slot: number) => {
    setSelected((prev) => {
      const next: Selected = [...prev] as Selected;
      next[slot] = null;
      return next;
    });
  }, []);

  const handlePopularPair = useCallback((slugA: string, slugB: string) => {
    setSelected([slugA, slugB]);
  }, []);

  // ---- Exclude already-selected slugs from picker ----
  const excludeSlugs = selected.filter((s): s is string => s !== null);

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}>
      {/* ── Header ── */}
      <Text
        style={[
          Typography.heroTitle,
          styles.title,
          { color: colors.textPrimary },
        ]}>
        MixCheck
      </Text>
      <Text
        style={[
          Typography.caption,
          styles.subtitle,
          { color: colors.textSecondary },
        ]}>
        Interaction checker module shell for comparing two substances.
      </Text>

      {/* ── Substance selection ── */}
      <View style={styles.pickerArea}>
        <SelectedSubstanceChips
          selected={selected}
          onAdd={openPicker}
          onRemove={handleRemove}
        />
      </View>

      {/* ── Result area ── */}
      <ScrollView
        style={styles.resultScroll}
        contentContainerStyle={styles.resultContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.popularSection}>
          <Text style={[Typography.captionBold, { color: colors.textSecondary }]}>
            Popular combinations
          </Text>
          <View style={styles.popularGrid}>
            {POPULAR_INTERACTION_PAIRS.map((pair) => (
              <Pressable
                key={pair.label}
                onPress={() => handlePopularPair(pair.slugs[0], pair.slugs[1])}
                style={({ pressed }) => [
                  styles.popularChip,
                  {
                    backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundSecondary,
                  },
                ]}>
                <Text style={[Typography.chip, { color: colors.textPrimary }]}>
                  {pair.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Empty state */}
        {filledCount === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="git-compare-outline"
              size={40}
              color={colors.textTertiary}
            />
            <Text
              style={[
                Typography.body,
                {
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginTop: Spacing.md,
                },
              ]}>
              Select two substances to preview{'\n'}the native interaction checker.
            </Text>
          </View>
        )}

        {/* One selected */}
        {filledCount === 1 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="arrow-up-outline"
              size={32}
              color={colors.accent}
            />
            <Text
              style={[
                Typography.body,
                {
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginTop: Spacing.md,
                },
              ]}>
              Select a second substance.
            </Text>
          </View>
        )}

        {/* Loading */}
        {interactionState.status === 'loading' && (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text
              style={[
                Typography.body,
                { color: colors.textSecondary, marginTop: Spacing.md },
              ]}>
              Checking interaction…
            </Text>
          </View>
        )}

        {/* Error */}
        {interactionState.status === 'error' && (
          <View
            style={[
              styles.noDataCard,
              { backgroundColor: colors.backgroundSecondary },
            ]}>
            <Ionicons
              name="alert-circle-outline"
              size={28}
              color={colors.severityRisky}
            />
            <Text
              style={[
                Typography.bodyBold,
                { color: colors.textPrimary, marginTop: Spacing.md },
              ]}>
              Unable to load
            </Text>
            <Text
              style={[
                Typography.body,
                {
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginTop: Spacing.sm,
                },
              ]}>
              {interactionState.message}
            </Text>
          </View>
        )}

        {/* Two selected, no data */}
        {interactionState.status === 'not_found' && (
          <View
            style={[
              styles.noDataCard,
              { backgroundColor: colors.backgroundSecondary },
            ]}>
            <Ionicons
              name="information-circle-outline"
              size={28}
              color={colors.textTertiary}
            />
            <Text
              style={[
                Typography.bodyBold,
                { color: colors.textPrimary, marginTop: Spacing.md },
              ]}>
              Keine kuratierte Bewertung vorhanden
            </Text>
            <Text
              style={[
                Typography.body,
                {
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginTop: Spacing.sm,
                },
              ]}>
              Fuer diese Kombination liegt lokal noch keine kuratierte Bewertung vor.
            </Text>
            <View
              style={[
                styles.warningBanner,
                { backgroundColor: 'rgba(255,149,0,0.10)' },
              ]}>
              <Ionicons
                name="warning-outline"
                size={16}
                color={colors.severityRisky}
              />
              <Text
                style={[
                  Typography.caption,
                  {
                    color: colors.textSecondary,
                    flex: 1,
                    marginLeft: Spacing.sm,
                  },
                ]}>
                Absence of data does not mean safe. Mischkonsum kann auch ohne kuratierte Bewertung riskant sein.
              </Text>
            </View>
          </View>
        )}

        {/* Result */}
        {interactionState.status === 'success' && (
          <InteractionResultCard interaction={interactionState.data} />
        )}
      </ScrollView>

      {/* ── Picker Modal ── */}
      <SubstancePicker
        visible={pickerVisible}
        onSelect={handleSelect}
        onClose={() => setPickerVisible(false)}
        excludeSlugs={excludeSlugs}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  title: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  subtitle: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  pickerArea: {
    marginBottom: Spacing.xl,
  },
  resultScroll: {
    flex: 1,
  },
  resultContent: {
    paddingBottom: Spacing.xxxl,
  },
  popularSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  popularChip: {
    minHeight: 34,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xxl,
  },
  noDataCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignSelf: 'stretch',
  },
});
