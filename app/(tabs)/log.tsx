import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

const UNITS = ['mg', 'ug', 'g', 'ml'] as const;
const ROUTES = ['oral', 'nasal', 'smoked', 'sublingual'] as const;

export default function LogScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [unit, setUnit] = useState<(typeof UNITS)[number]>('mg');
  const [route, setRoute] = useState<(typeof ROUTES)[number]>('oral');

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[Typography.heroTitle, { color: colors.textPrimary }]}>Dose Log</Text>
          <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
            Local-first logging shell for private dose notes. Saving is intentionally not wired yet.
          </Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.backgroundSecondary }]}>
          <Field label="Substance" placeholder="e.g. MDMA" />
          <Field label="Dose" placeholder="e.g. 80" keyboardType="decimal-pad" />

          <View style={styles.group}>
            <Text style={[Typography.captionBold, { color: colors.textSecondary }]}>Unit</Text>
            <View style={styles.chipRow}>
              {UNITS.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setUnit(item)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: unit === item ? colors.accent : colors.backgroundTertiary,
                    },
                  ]}>
                  <Text style={[Typography.chip, { color: unit === item ? '#FFFFFF' : colors.textSecondary }]}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.group}>
            <Text style={[Typography.captionBold, { color: colors.textSecondary }]}>Route</Text>
            <View style={styles.chipRow}>
              {ROUTES.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setRoute(item)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: route === item ? colors.accent : colors.backgroundTertiary,
                    },
                  ]}>
                  <Text style={[Typography.chip, { color: route === item ? '#FFFFFF' : colors.textSecondary }]}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Field label="Timestamp" placeholder="Now" />
          <Field label="Notes" placeholder="Context, effects, reminders" multiline />
        </View>

        <View style={[styles.localNote, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.accent} />
          <Text style={[Typography.caption, styles.localNoteText, { color: colors.textSecondary }]}>
            This screen is a UI placeholder only. No entries are stored or uploaded.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'decimal-pad';
  multiline?: boolean;
}) {
  const colors = useThemeColors();

  return (
    <View style={styles.group}>
      <Text style={[Typography.captionBold, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          Typography.body,
          styles.input,
          multiline && styles.notesInput,
          { backgroundColor: colors.backgroundTertiary, color: colors.textPrimary },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  formCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  group: {
    gap: Spacing.sm,
  },
  input: {
    minHeight: 46,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  notesInput: {
    minHeight: 96,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    minHeight: 34,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  localNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  localNoteText: {
    flex: 1,
  },
});
