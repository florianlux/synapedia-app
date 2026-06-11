import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useThemeColors } from '@/hooks/use-theme';
import { Elevation, Typography, Spacing, Radius, getScreenBottomPadding } from '@/constants/theme';
import { POPULAR_INTERACTION_PAIRS } from '@/constants/interactions';
import { useInteraction } from '@/hooks/use-interaction';
import { SubstancePicker } from '@/components/interaction/SubstancePicker';
import { SelectedSubstanceChips } from '@/components/interaction/SelectedSubstanceChips';
import { InteractionResultCard } from '@/components/interaction/InteractionResultCard';
import { StateCard } from '@/components/ui/StateCard';

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
  const showResultState = filledCount === 2;

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
      <View style={styles.header}>
        <View style={[styles.heroCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
          <View style={styles.heroTop}>
            <View style={[styles.heroIcon, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="git-compare" size={24} color={colors.accent} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={[Typography.heroTitle, styles.title, { color: colors.textPrimary }]}>
                MixCheck
              </Text>
              <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
                Zwei Substanzen wählen, Risiko lesen, Warnzeichen ernst nehmen.
              </Text>
            </View>
          </View>
          <View style={styles.heroMetaRow}>
            <MiniFact icon="cloud-outline" label="Live + Fallback" />
            <MiniFact icon="shield-outline" label="Konservativ" />
            <MiniFact icon="phone-portrait-outline" label="iOS-first" />
          </View>
        </View>
      </View>

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
        contentContainerStyle={[
          styles.resultContent,
          { paddingBottom: getScreenBottomPadding(insets.bottom, Spacing.lg) },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.popularSection}>
          <Text style={[Typography.captionBold, { color: colors.textSecondary }]}>
            Beliebte Kombinationen
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
                    borderColor: pressed ? `${colors.accent}55` : colors.border,
                  },
                ]}>
                <Text style={[Typography.chip, { color: colors.textPrimary }]}>
                  {pair.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {filledCount === 0 && (
          <StateCard
            icon="git-network-outline"
            title="Bereit für den Check"
            body="Wähle zwei Substanzen oder starte mit einer häufigen Kombination."
          />
        )}

        {filledCount === 1 && (
          <StateCard
            icon="add-circle-outline"
            title="Eine zweite Substanz fehlt"
            body="Der Check läuft erst mit zwei Einträgen. Tippe auf den freien Slot."
          />
        )}

        {showResultState && interactionState.status === 'loading' && (
          <StateCard
            icon="sync-outline"
            title="Kombination wird geprüft"
            body="Live-Daten werden abgefragt. Lokale Bewertungen erscheinen sofort, wenn sie vorhanden sind."
            loading
          />
        )}

        {showResultState && interactionState.status === 'error' && (
          <StateCard
            icon="alert-circle-outline"
            title="Live-Check nicht erreichbar"
            body={interactionState.message || 'Lokale Fallback-Daten bleiben aktiv, wenn sie vorhanden sind.'}
            danger
          />
        )}

        {showResultState && interactionState.status === 'not_found' && (
          <StateCard
            icon="information-circle-outline"
            title="Keine belastbare Bewertung"
            body="Fehlende Daten bedeuten nicht sicher. Mischkonsum kann auch ohne kuratierte Bewertung riskant sein."
            danger
          />
        )}

        {/* Result */}
        {interactionState.status === 'success' && (
          <InteractionResultCard
            interaction={interactionState.data}
            source={interactionState.source}
            refreshing={interactionState.refreshing}
          />
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

function MiniFact({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  const colors = useThemeColors();

  return (
    <View style={[styles.miniFact, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
      <Ionicons name={icon} size={13} color={colors.accent} />
      <Text style={[Typography.quickFactLabel, { color: colors.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.page,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  heroCard: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    ...Elevation.card,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
  },
  title: {
    includeFontPadding: false,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  miniFact: {
    minHeight: 28,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  pickerArea: {
    marginBottom: Spacing.xl,
  },
  resultScroll: {
    flex: 1,
  },
  resultContent: {
    paddingBottom: Spacing.screenBottom,
  },
  popularSection: {
    paddingHorizontal: Spacing.page,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  popularChip: {
    minHeight: 44,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
