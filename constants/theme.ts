/**
 * Synapedia Design Tokens
 * 8pt grid system. All spacing values are multiples of 4pt or 8pt.
 * Typography based on SF Pro (system font).
 */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Typography = {
  heroTitle: { fontSize: 32, fontWeight: '700' as const, lineHeight: 38 },
  navTitle: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  sectionTitle: { fontSize: 20, fontWeight: '700' as const, lineHeight: 25 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  captionBold: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  chip: { fontSize: 13, fontWeight: '500' as const, lineHeight: 16 },
  quickFactValue: { fontSize: 15, fontWeight: '700' as const, lineHeight: 20 },
  quickFactLabel: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
  tabLabel: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18 },
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export const Colors = {
  light: {
    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F7',
    backgroundTertiary: '#EBEBF0',

    // Text
    textPrimary: '#1C1C1E',
    textSecondary: '#6B6B80',
    textTertiary: '#AEAEB2',

    // Accent
    accent: '#007AFF',
    accentLight: '#E5F1FF',

    // Semantic
    separator: 'rgba(60,60,67,0.12)',

    // Risk Levels
    riskLow: '#34C759',
    riskModerate: '#FF9500',
    riskHigh: '#FF3B30',
    riskExtreme: '#AF1A2D',
    riskUnknown: '#8E8E93',

    // Severity (Interactions)
    severityLethal: '#AF1A2D',
    severityDangerous: '#FF3B30',
    severityRisky: '#FF9500',
    severityCaution: '#FFCC00',
    severityLowRisk: '#34C759',

    // Effects
    effectPositive: '#34C759',
    effectNeutral: '#8E8E93',
    effectNegative: '#FF3B30',

    // Tab Bar
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#007AFF',
  },
  dark: {
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    backgroundTertiary: '#2C2C2E',

    textPrimary: '#FFFFFF',
    textSecondary: '#98989F',
    textTertiary: '#636366',

    accent: '#0A84FF',
    accentLight: '#1A2E4A',

    separator: 'rgba(84,84,88,0.36)',

    riskLow: '#30D158',
    riskModerate: '#FF9F0A',
    riskHigh: '#FF453A',
    riskExtreme: '#D63A4A',
    riskUnknown: '#636366',

    severityLethal: '#D63A4A',
    severityDangerous: '#FF453A',
    severityRisky: '#FF9F0A',
    severityCaution: '#FFD60A',
    severityLowRisk: '#30D158',

    effectPositive: '#30D158',
    effectNeutral: '#636366',
    effectNegative: '#FF453A',

    tabIconDefault: '#636366',
    tabIconSelected: '#0A84FF',
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };
