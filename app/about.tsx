import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Elevation, Radius, Spacing, Typography, getScreenBottomPadding } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

type InfoItem = {
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const SAFETY_ITEMS: InfoItem[] = [
  {
    title: 'Harm-Reduction-Wissensapp',
    body: 'Synapedia ordnet Substanz-, Interaktions- und Recovery-Kontext für Lernen und Reflexion ein.',
    icon: 'book-outline',
  },
  {
    title: 'Keine medizinische Beratung',
    body: 'Die App diagnostiziert, behandelt oder verschreibt nicht und ersetzt keine professionelle Versorgung.',
    icon: 'medkit-outline',
  },
  {
    title: 'Keine Notfallversorgung',
    body: 'Synapedia wird nicht überwacht und kann nicht auf akute Situationen reagieren. Bei Notfällen lokale Notfalldienste kontaktieren.',
    icon: 'alert-circle-outline',
  },
  {
    title: 'Keine Konsumempfehlung',
    body: 'Inhalte erklären Risiken und Unsicherheit. Sie ermutigen nicht zu illegalem Substanzgebrauch oder riskantem Verhalten.',
    icon: 'shield-outline',
  },
];

const PRIVACY_ITEMS: InfoItem[] = [
  {
    title: 'Lokale private Notizen',
    body: 'Private Notizen bleiben auf diesem Gerät, außer du exportierst oder teilst sie ausdrücklich.',
    icon: 'lock-closed-outline',
  },
  {
    title: 'Live-Abfragen',
    body: 'Wiki-Suchen, Detailseiten und MixCheck-Anfragen können synapedia.com kontaktieren, um Live-Ergebnisse zu laden.',
    icon: 'cloud-outline',
  },
  {
    title: 'Kein Tracking-Stack',
    body: 'Der aktuelle App-Code enthält keine Werbe-SDKs, Tracking-Permission, Standortabfrage, HealthKit-Integration oder Analytics-SDKs.',
    icon: 'eye-off-outline',
  },
];

export default function AboutScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.navBar,
          { paddingTop: insets.top, backgroundColor: colors.backgroundGlass, borderBottomColor: colors.separator },
        ]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.navButton}>
          <Ionicons name="chevron-back" size={28} color={colors.accent} />
        </Pressable>
        <Text style={[Typography.navTitle, styles.navTitle, { color: colors.textPrimary }]}>
          Sicherheit & Datenschutz
        </Text>
        <View style={styles.navButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: getScreenBottomPadding(insets.bottom) },
        ]}>
        <View style={[styles.hero, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
          <View style={[styles.heroIcon, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="shield-checkmark-outline" size={26} color={colors.accent} />
          </View>
          <Text style={[Typography.heroTitle, styles.title, { color: colors.textPrimary }]}>
            Review-Rahmen
          </Text>
          <Text style={[Typography.body, { color: colors.textSecondary }]}>
            Synapedia ist eine Harm-Reduction- und Wissens-App. Sie macht Risikokontext sichtbar, ersetzt keine medizinische Beratung und ist keine Notfallversorgung.
          </Text>
        </View>

        <Section title="Sicherheitsgrenzen" items={SAFETY_ITEMS} />
        <Section title="Datenschutzgrenzen" items={PRIVACY_ITEMS} />

        <View style={[styles.footerNote, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
          <Text style={[Typography.caption, styles.footerText, { color: colors.textSecondary }]}>
            Vor einer öffentlichen App-Store-Einreichung müssen Logging und Aufbewahrung auf synapedia.com in der Datenschutzerklärung bestätigt sein.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, items }: { title: string; items: InfoItem[] }) {
  const colors = useThemeColors();

  return (
    <View style={styles.section}>
      <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      <View style={styles.cardList}>
        {items.map((item) => (
          <View
            key={item.title}
            style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
            <View style={[styles.cardIcon, { backgroundColor: colors.backgroundSecondary }]}>
              <Ionicons name={item.icon} size={19} color={colors.accent} />
            </View>
            <View style={styles.cardText}>
              <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>
                {item.title}
              </Text>
              <Text style={[Typography.caption, styles.cardBody, { color: colors.textSecondary }]}>
                {item.body}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: Spacing.page,
  },
  hero: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    ...Elevation.subtle,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  section: {
    marginTop: Spacing.xxl,
    gap: Spacing.md,
  },
  cardList: {
    gap: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    ...Elevation.subtle,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardBody: {
    marginTop: Spacing.xs,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.xxl,
    padding: Spacing.md,
  },
  footerText: {
    flex: 1,
  },
});
