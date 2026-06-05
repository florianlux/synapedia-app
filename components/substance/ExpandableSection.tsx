import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

import { useThemeColors } from '@/hooks/use-theme';
import { Elevation, Radius, Typography, Spacing } from '@/constants/theme';

interface Props {
  title: string;
  badge?: number;
  children: React.ReactNode;
  /** When true, the section is not rendered at all (e.g. no data available). */
  hidden?: boolean;
  initialExpanded?: boolean;
}

export function ExpandableSection({
  title,
  badge,
  children,
  hidden,
  initialExpanded = false,
}: Props) {
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(initialExpanded);

  const toggle = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded((prev) => !prev);
  }, []);

  if (hidden) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundElevated, borderColor: colors.cardBorder }]}>
      <Pressable
        onPress={toggle}
        style={styles.header}
        accessibilityRole="button"
        accessibilityState={{ expanded }}>
        <View style={styles.titleRow}>
          <Text style={[Typography.sectionTitle, { color: colors.textPrimary }]}>
            {title}
          </Text>
          {badge !== undefined && badge > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.accentLight, borderColor: `${colors.accent}45` }]}>
              <Text style={[styles.badgeText, { color: colors.accent }]}>{badge}</Text>
            </View>
          )}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textTertiary}
        />
      </Pressable>
      {expanded && (
        <View style={[styles.contentWrap, { borderTopColor: colors.separator }]}>
          <View style={styles.content}>
            {children}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.page,
    marginTop: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.xl,
    ...Elevation.subtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 52,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    paddingRight: Spacing.md,
  },
  badge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
});
