import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          lineHeight: 14,
          marginTop: 1,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
        tabBarItemStyle: {
          borderRadius: Radius.md,
          marginHorizontal: 2,
          paddingTop: 2,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 10,
          right: 10,
          bottom: bottomInset,
          height: 68 + bottomInset,
          paddingTop: 6,
          paddingHorizontal: 8,
          paddingBottom: Math.max(bottomInset - 2, 10),
          backgroundColor: colors.backgroundGlass,
          borderTopColor: `${colors.accent}25`,
          borderTopWidth: 1,
          borderRadius: Radius.xl,
          shadowColor: colors.accent,
          shadowOpacity: 0.12,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: -4 },
          elevation: 12,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wiki"
        options={{
          title: 'Wiki',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'library' : 'library-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="check"
        options={{
          title: 'Check',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'git-compare' : 'git-compare-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'create' : 'create-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="guides"
        options={{
          title: 'Guides',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'heart-circle' : 'heart-circle-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
