import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/hooks/use-theme';
import { Typography, Spacing, Radius } from '@/constants/theme';

interface Props {
  onCheckInteraction?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function StickyBottomBar({
  onCheckInteraction,
  onSave,
  isSaved = false,
}: Props) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, Spacing.md),
          backgroundColor: colors.background,
          borderTopColor: colors.separator,
        },
      ]}>
      <Pressable
        onPress={onCheckInteraction}
        style={({ pressed }) => [
          styles.primaryButton,
          {
            backgroundColor: pressed ? '#0066D6' : colors.accent,
          },
        ]}>
        <Text style={[Typography.bodyBold, { color: '#FFFFFF' }]}>
          Kombination checken
        </Text>
      </Pressable>
      <Pressable
        onPress={onSave}
        style={({ pressed }) => [
          styles.secondaryButton,
          {
            backgroundColor: pressed
              ? colors.backgroundTertiary
              : isSaved
                ? colors.accentLight
                : colors.backgroundSecondary,
            borderColor: isSaved ? colors.accent : colors.separator,
          },
        ]}>
        <Text
          style={[
            Typography.bodyBold,
            { color: isSaved ? colors.accent : colors.textSecondary },
          ]}>
          {isSaved ? 'Gespeichert' : 'Speichern'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.page,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  primaryButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
});
