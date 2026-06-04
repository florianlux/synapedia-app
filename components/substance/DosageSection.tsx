import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import { Typography, Spacing, Radius } from '@/constants/theme';
import type { DoseRoute } from '@/types/substance';

interface Props {
  routes: DoseRoute[];
}

export function DosageSection({ routes }: Props) {
  const colors = useThemeColors();
  const [activeRoute, setActiveRoute] = useState(0);
  const route = routes[activeRoute];

  if (!route) return null;

  return (
    <View>
      {/* Route tabs — only shown when multiple routes */}
      {routes.length > 1 && (
        <View style={styles.tabs}>
          {routes.map((r, i) => {
            const isActive = i === activeRoute;
            return (
              <Pressable
                key={r.name}
                onPress={() => setActiveRoute(i)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: isActive
                      ? colors.accent
                      : colors.backgroundSecondary,
                  },
                ]}>
                <Text
                  style={[
                    Typography.tabLabel,
                    { color: isActive ? '#FFFFFF' : colors.textSecondary },
                  ]}>
                  {r.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Dose ranges */}
      {route.ranges.map((range, index) => (
        <View
          key={range.label}
          style={[
            styles.row,
            index < route.ranges.length - 1 && {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.separator,
            },
          ]}>
          <Text style={[Typography.body, { color: colors.textSecondary, flex: 1 }]}>
            {range.label}
          </Text>
          <Text style={[Typography.bodyBold, { color: colors.textPrimary }]}>
            {range.value}
          </Text>
        </View>
      ))}

      {/* Disclaimer */}
      {route.disclaimer && (
        <Text
          style={[
            Typography.caption,
            styles.disclaimer,
            { color: colors.textTertiary },
          ]}>
          {route.disclaimer}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  disclaimer: {
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
});
