import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { GUIDE_DISCLAIMER } from '@/constants/guides';
import { Elevation, Radius, Spacing, Typography } from '@/constants/theme';
import { useGuides } from '@/hooks/use-guides';
import { useThemeColors } from '@/hooks/use-theme';
import { SourceBadge } from '@/components/ui/SourceBadge';

export default function GuidesScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const guidesState = useGuides();
  const guides = guidesState.status === 'success' ? guidesState.data : [];
  const source = guidesState.status === 'success' ? guidesState.source : 'local';
  const refreshing = guidesState.status === 'success' ? guidesState.refreshing : false;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.screenBottom + Spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[Typography.heroTitle, { color: colors.textPrimary }]}>Guides</Text>
          <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
            Ruhige, lokal kuratierte Einstiege zu Recovery, Entzug und Harm Reduction.
          </Text>
          <View style={styles.sourceRow}>
            <SourceBadge source={source} refreshing={refreshing} />
          </View>
        </View>

        <View style={styles.guideList}>
          {guides.map((guide) => (
            <Pressable
              key={guide.slug}
              onPress={() => router.push({ pathname: '/guides/[slug]', params: { slug: guide.slug } })}
              style={({ pressed }) => [
                styles.guideCard,
                {
                  backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundElevated,
                  borderColor: colors.cardBorder,
                  shadowColor: guide.accent,
                },
              ]}>
              <View style={[styles.iconBox, { backgroundColor: `${guide.accent}20` }]}>
                <Ionicons name="book-outline" size={23} color={guide.accent} />
              </View>
              <View style={styles.guideContent}>
                <Text style={[Typography.captionBold, { color: guide.accent }]}>
                  {guide.category}
                </Text>
                <Text
                  style={[Typography.bodyBold, styles.guideTitle, { color: colors.textPrimary }]}
                  numberOfLines={2}>
                  {guide.title}
                </Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]} numberOfLines={2}>
                  {guide.summary}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>

        <View style={[styles.note, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
          <Text style={[Typography.caption, styles.noteText, { color: colors.textSecondary }]}>
            {GUIDE_DISCLAIMER}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
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
  sourceRow: {
    alignItems: 'flex-start',
    marginTop: Spacing.md,
  },
  guideList: {
    gap: Spacing.sm,
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    ...Elevation.subtle,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  noteText: {
    flex: 1,
  },
});
