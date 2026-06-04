import { useCallback, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
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
}

export function ExpandableSection({ title, badge, children, hidden }: Props) {
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const contentHeight = useSharedValue(0);
  const progress = useSharedValue(0);

  const toggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded((prev) => {
      const next = !prev;
      progress.value = withTiming(next ? 1 : 0, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
      return next;
    });
  }, [progress]);

  const onContentLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const h = e.nativeEvent.layout.height;
      if (h > 0) {
        contentHeight.value = h;
      }
    },
    [contentHeight],
  );

  const bodyStyle = useAnimatedStyle(() => {
    if (contentHeight.value === 0) {
      return { height: 0, overflow: 'hidden' as const };
    }
    return {
      height: interpolate(progress.value, [0, 1], [0, contentHeight.value]),
      opacity: interpolate(progress.value, [0, 0.15, 1], [0, 1, 1]),
      overflow: 'hidden' as const,
    };
  });

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(progress.value, [0, 1], [0, 90])}deg` },
    ],
  }));

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
        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </Animated.View>
      </Pressable>
      <Animated.View style={bodyStyle}>
        <View onLayout={onContentLayout} style={styles.content}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.page,
    marginTop: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.xl,
    overflow: 'hidden',
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
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
});
