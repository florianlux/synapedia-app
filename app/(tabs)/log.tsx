import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type KeyboardTypeOptions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { SUBSTANCES } from '@/constants/mock-data';
import { Elevation, Radius, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

const STORAGE_KEY = 'synapedia:dose-log:v1';
const UNITS = ['mg', 'ug', 'g', 'ml'] as const;
const ROUTES = ['oral', 'nasal', 'smoked', 'sublingual', 'other'] as const;

type DoseEntry = {
  id: string;
  substance: string;
  dose?: string;
  unit: (typeof UNITS)[number];
  route: (typeof ROUTES)[number];
  timestamp: string;
  notes?: string;
  mood?: string;
  createdAt?: string;
};

type FormState = {
  substance: string;
  dose: string;
  unit: (typeof UNITS)[number];
  route: (typeof ROUTES)[number];
  timestamp: string;
  notes: string;
  mood: string;
};

type ExportStatus = 'info' | 'success' | 'error';

function nowInputValue(): string {
  return new Date().toISOString().slice(0, 16);
}

function initialForm(): FormState {
  return {
    substance: '',
    dose: '',
    unit: 'mg',
    route: 'oral',
    timestamp: nowInputValue(),
    notes: '',
    mood: '',
  };
}

function validateForm(form: FormState): string | null {
  if (!form.substance.trim()) return 'Substanz ist erforderlich.';
  if (!form.timestamp.trim()) return 'Zeitpunkt ist erforderlich.';
  if (form.dose.trim() && Number.isNaN(Number(form.dose.replace(',', '.')))) {
    return 'Dosis muss numerisch sein, wenn sie angegeben wird.';
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function isUnit(value: string | undefined): value is DoseEntry['unit'] {
  return value === 'mg' || value === 'ug' || value === 'g' || value === 'ml';
}

function isRoute(value: string | undefined): value is DoseEntry['route'] {
  return value === 'oral' || value === 'nasal' || value === 'smoked' || value === 'sublingual' || value === 'other';
}

function normalizeDoseEntries(value: unknown): DoseEntry[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index): DoseEntry | null => {
      const record = asRecord(item);
      const substance = stringValue(record?.substance);
      const timestamp = stringValue(record?.timestamp);
      if (!record || !substance || !timestamp) return null;

      const unit = stringValue(record.unit);
      const route = stringValue(record.route);
      const entry: DoseEntry = {
        id: stringValue(record.id) ?? `${timestamp}-${substance}-${index}`,
        substance,
        unit: isUnit(unit) ? unit : 'mg',
        route: isRoute(route) ? route : 'other',
        timestamp,
      };
      const dose = stringValue(record.dose);
      const notes = stringValue(record.notes);
      const mood = stringValue(record.mood);
      const createdAt = stringValue(record.createdAt);

      if (dose) entry.dose = dose;
      if (notes) entry.notes = notes;
      if (mood) entry.mood = mood;
      if (createdAt) entry.createdAt = createdAt;

      return entry;
    })
    .filter((entry): entry is DoseEntry => entry !== null);
}

function entryTime(entry: DoseEntry): number {
  const parsed = Date.parse(entry.timestamp);
  return Number.isNaN(parsed) ? Date.parse(entry.createdAt ?? '') : parsed;
}

function exportDateStamp(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function csvEscape(value: string | undefined): string {
  const text = value ?? '';
  const shouldQuote = /[",\r\n]/.test(text);
  const escaped = text.replace(/"/g, '""');
  return shouldQuote ? `"${escaped}"` : escaped;
}

function doseEntriesToCsv(entries: DoseEntry[]): string {
  const headers = [
    'id',
    'substance',
    'dose',
    'unit',
    'route',
    'timestamp',
    'mood/condition',
    'notes',
    'createdAt',
  ];
  const rows = entries.map((entry) => [
    entry.id,
    entry.substance,
    entry.dose,
    entry.unit,
    entry.route,
    entry.timestamp,
    entry.mood,
    entry.notes,
    entry.createdAt,
  ]);

  return [headers, ...rows]
    .map((row) => row.map((value) => csvEscape(value)).join(','))
    .join('\n');
}

function downloadCsvOnWeb(csv: string, fileName: string): boolean {
  if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof Blob === 'undefined') {
    return false;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

export default function LogScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const [form, setForm] = useState<FormState>(() => initialForm());
  const [entries, setEntries] = useState<DoseEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<ExportStatus>('info');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!mounted || !value) return;
        setEntries(normalizeDoseEntries(JSON.parse(value) as unknown));
      })
      .catch(() => {
        if (mounted) setError('Could not load local log entries.');
      })
      .finally(() => {
        if (mounted) setHydrated(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries)).catch(() => {
      setError('Could not save local log entries.');
    });
  }, [entries, hydrated]);

  const suggestions = useMemo(() => {
    const term = form.substance.trim().toLowerCase();
    const candidates = term
      ? SUBSTANCES.filter((substance) => {
          const haystack = [
            substance.name,
            substance.slug,
            substance.primaryClass,
            ...(substance.aliases ?? []),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(term);
        })
      : SUBSTANCES.slice(0, 6);

    return candidates.slice(0, 6);
  }, [form.substance]);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => entryTime(b) - entryTime(a)),
    [entries],
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
    setExportMessage(null);
  }

  function addEntry() {
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    const entry: DoseEntry = {
      id: `${Date.now()}`,
      substance: form.substance.trim(),
      dose: form.dose.trim() || undefined,
      unit: form.unit,
      route: form.route,
      timestamp: form.timestamp.trim(),
      notes: form.notes.trim() || undefined,
      mood: form.mood.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    setEntries((current) => [entry, ...current]);
    setForm(initialForm());
    setError(null);
    setExportMessage(null);
  }

  function deleteEntry(id: string) {
    Alert.alert(
      'Eintrag löschen?',
      'Der lokale Dose-Log-Eintrag wird von diesem Gerät entfernt.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => setEntries((current) => current.filter((entry) => entry.id !== id)),
        },
      ],
    );
  }

  async function exportCsv() {
    if (isExporting) return;

    setIsExporting(true);
    setExportMessage(null);
    setExportStatus('info');

    try {
      if (!hydrated) {
        setExportStatus('error');
        setExportMessage('Dose Log wird noch geladen. Bitte gleich erneut versuchen.');
        return;
      }

      if (sortedEntries.length === 0) {
        setExportStatus('error');
        setExportMessage('Keine Einträge zum Exportieren vorhanden.');
        return;
      }

      const fileName = `synapedia-dose-log-${exportDateStamp()}.csv`;
      const csv = doseEntriesToCsv(sortedEntries);

      if (Platform.OS === 'web') {
        const downloaded = downloadCsvOnWeb(csv, fileName);
        setExportStatus(downloaded ? 'success' : 'info');
        setExportMessage(
          downloaded
            ? `${fileName} wurde im Browser heruntergeladen.`
            : 'Nativer Datei-Export ist in dieser Web-Vorschau nicht verfügbar.',
        );
        return;
      }

      if (!FileSystem.documentDirectory) {
        setExportStatus('error');
        setExportMessage('Datei-Export ist auf diesem Gerät gerade nicht verfügbar.');
        return;
      }

      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const sharingAvailable = await Sharing.isAvailableAsync();
      if (!sharingAvailable) {
        setExportStatus('info');
        setExportMessage(`${fileName} wurde lokal erstellt, aber Teilen ist auf diesem Gerät nicht verfügbar.`);
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        UTI: 'public.comma-separated-values-text',
        dialogTitle: 'Synapedia Dose Log exportieren',
      });
      await FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {
        // Sharing succeeded; a stale temp export is harmless and can be overwritten next time.
      });
      setExportStatus('success');
      setExportMessage(`${fileName} wurde geteilt. Die temporäre Exportdatei wurde danach entfernt.`);
    } catch {
      setExportStatus('error');
      setExportMessage('CSV-Export fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.screenBottom + Spacing.xl },
        ]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[Typography.heroTitle, { color: colors.textPrimary }]}>Dose Log</Text>
          <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
            Lokales Konsumprotokoll zur Selbstreflexion. Kein Account, keine Cloud-Synchronisierung.
          </Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
          <Field
            label="Substanz"
            value={form.substance}
            onChangeText={(value) => updateField('substance', value)}
            placeholder="z. B. MDMA"
          />

          <View style={styles.suggestionRow}>
            {suggestions.map((substance) => (
              <Pressable
                key={substance.slug}
                onPress={() => updateField('substance', substance.name)}
                style={({ pressed }) => [
                  styles.suggestionChip,
                  {
                    backgroundColor: pressed ? colors.accentLight : colors.backgroundSecondary,
                    borderColor: pressed ? `${colors.accent}55` : colors.border,
                  },
                ]}>
                <Text style={[Typography.chip, { color: colors.textSecondary }]}>
                  {substance.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.row, isCompact && styles.rowCompact]}>
            <View style={styles.rowField}>
              <Field
                label="Dosis"
                value={form.dose}
                onChangeText={(value) => updateField('dose', value)}
                placeholder="80"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.rowField}>
              <Text style={[Typography.captionBold, { color: colors.textSecondary }]}>Einheit</Text>
              <ChipRow
                items={UNITS}
                selected={form.unit}
                onSelect={(value) => updateField('unit', value)}
              />
            </View>
          </View>

          <View style={styles.group}>
            <Text style={[Typography.captionBold, { color: colors.textSecondary }]}>Einnahmeweg</Text>
            <ChipRow
              items={ROUTES}
              selected={form.route}
              onSelect={(value) => updateField('route', value)}
            />
          </View>

          <Field
            label="Zeitpunkt"
            value={form.timestamp}
            onChangeText={(value) => updateField('timestamp', value)}
            placeholder="2026-06-05T12:30"
          />
          <Field
            label="Stimmung / Zustand"
            value={form.mood}
            onChangeText={(value) => updateField('mood', value)}
            placeholder="z. B. ruhig, ängstlich, müde"
          />
          <Field
            label="Notizen"
            value={form.notes}
            onChangeText={(value) => updateField('notes', value)}
            placeholder="Kontext, Wirkung, Erinnerungen"
            multiline
          />

          {error && (
            <Text style={[Typography.captionBold, { color: colors.severityDangerous }]}>
              {error}
            </Text>
          )}

          <Pressable
            onPress={addEntry}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: pressed ? colors.tabIconSelected : colors.accent },
            ]}>
            <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
            <Text style={[Typography.bodyBold, { color: '#FFFFFF' }]}>Eintrag hinzufügen</Text>
          </Pressable>
        </View>

        <View style={[styles.localNote, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.accent} />
          <Text style={[Typography.caption, styles.localNoteText, { color: colors.textSecondary }]}>
            Einträge bleiben auf diesem Gerät; es gibt keinen Account und keine Cloud-Synchronisierung.
            Geräte-Backups oder CSV-Exporte können Daten außerhalb der App speichern.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]}>Letzte Einträge</Text>
          <Pressable
            onPress={exportCsv}
            accessibilityRole="button"
            accessibilityState={{ disabled: isExporting }}
            style={({ pressed }) => [
              styles.exportButton,
              {
                backgroundColor: pressed || isExporting ? colors.backgroundTertiary : colors.backgroundElevated,
                borderColor: colors.cardBorder,
                opacity: isExporting ? 0.68 : 1,
              },
            ]}>
            <Ionicons name="download-outline" size={16} color={colors.accent} />
            <Text style={[Typography.chip, { color: colors.accent }]}>
              {isExporting ? 'Exportiere...' : 'CSV exportieren'}
            </Text>
          </Pressable>
        </View>

        {exportMessage && (
          <Text
            style={[
              Typography.caption,
              styles.exportMessage,
              {
                color:
                  exportStatus === 'success'
                    ? colors.effectPositive
                    : exportStatus === 'error'
                      ? colors.severityDangerous
                      : colors.textSecondary,
              },
            ]}>
            {exportMessage}
          </Text>
        )}

        {sortedEntries.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
            <Ionicons name="document-text-outline" size={34} color={colors.textTertiary} />
            <Text style={[Typography.body, styles.emptyText, { color: colors.textSecondary }]}>
              Noch keine Einträge.
            </Text>
          </View>
        ) : (
          <View style={styles.entryList}>
            {sortedEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onDelete={() => deleteEntry(entry.id)} />
            ))}
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
}) {
  const colors = useThemeColors();

  return (
    <View style={styles.group}>
      <Text style={[Typography.captionBold, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          Typography.body,
          styles.input,
          multiline && styles.notesInput,
          { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, color: colors.textPrimary },
        ]}
      />
    </View>
  );
}

function ChipRow<T extends string>({
  items,
  selected,
  onSelect,
}: {
  items: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  const colors = useThemeColors();

  return (
    <View style={styles.chipRow}>
      {items.map((item) => (
        <Pressable
          key={item}
          onPress={() => onSelect(item)}
          style={[
            styles.chip,
            {
              backgroundColor: selected === item ? colors.accent : colors.backgroundTertiary,
              borderColor: selected === item ? `${colors.accent}75` : colors.border,
            },
          ]}>
          <Text style={[Typography.chip, { color: selected === item ? '#FFFFFF' : colors.textSecondary }]}>
            {item}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function EntryCard({ entry, onDelete }: { entry: DoseEntry; onDelete: () => void }) {
  const colors = useThemeColors();

  return (
    <View style={[styles.entryCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
      <View style={styles.entryHeader}>
        <View style={styles.entryTitleBlock}>
          <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>
            {entry.substance}
          </Text>
          <Text style={[Typography.caption, { color: colors.textSecondary }]}>
            {entry.dose ? `${entry.dose} ${entry.unit}` : 'Dosis nicht erfasst'} · {entry.route}
          </Text>
        </View>
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${entry.substance}-Eintrag löschen`}
          style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={19} color={colors.textTertiary} />
        </Pressable>
      </View>

      <Text style={[Typography.caption, styles.entryMeta, { color: colors.textTertiary }]}>
        {entry.timestamp}
      </Text>
      {entry.mood && (
        <Text style={[Typography.caption, { color: colors.textSecondary }]}>
          Stimmung / Zustand: {entry.mood}
        </Text>
      )}
      {entry.notes && (
        <Text style={[Typography.caption, styles.entryNotes, { color: colors.textSecondary }]}>
          {entry.notes}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboardAvoider: {
    flex: 1,
  },
  content: {
    padding: Spacing.page,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  formCard: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    gap: Spacing.lg,
    ...Elevation.subtle,
  },
  group: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  rowCompact: {
    flexDirection: 'column',
  },
  rowField: {
    flex: 1,
    gap: Spacing.sm,
  },
  input: {
    minHeight: 48,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  notesInput: {
    minHeight: 96,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  suggestionChip: {
    minHeight: 44,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    minHeight: 44,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  localNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  localNoteText: {
    flex: 1,
  },
  sectionHeader: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  exportButton: {
    minHeight: 44,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  exportMessage: {
    marginBottom: Spacing.sm,
  },
  emptyCard: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Elevation.subtle,
  },
  emptyText: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  entryList: {
    gap: Spacing.sm,
  },
  entryCard: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    ...Elevation.subtle,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  entryTitleBlock: {
    flex: 1,
  },
  deleteButton: {
    width: 44,
    height: 44,
    marginTop: -Spacing.sm,
    marginRight: -Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryMeta: {
    marginTop: Spacing.sm,
  },
  entryNotes: {
    marginTop: Spacing.xs,
  },
});
