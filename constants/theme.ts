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
  page: 20,
} as const;

export const Typography = {
  heroTitle: { fontSize: 34, fontWeight: '800' as const, lineHeight: 40 },
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
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const Colors = {
  light: {
    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F7',
    backgroundTertiary: '#EBEBF0',
    backgroundElevated: '#FFFFFF',
    backgroundGlass: 'rgba(255,255,255,0.82)',

    // Text
    textPrimary: '#1C1C1E',
    textSecondary: '#6B6B80',
    textTertiary: '#AEAEB2',

    // Accent
    accent: '#007AFF',
    accentLight: '#E5F1FF',

    // Semantic
    separator: 'rgba(60,60,67,0.12)',
    border: 'rgba(60,60,67,0.14)',
    cardBorder: 'rgba(60,60,67,0.10)',

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
    background: '#050608',
    backgroundSecondary: '#12151B',
    backgroundTertiary: '#20242C',
    backgroundElevated: '#171B22',
    backgroundGlass: 'rgba(18,21,27,0.82)',

    textPrimary: '#FFFFFF',
    textSecondary: '#A9B0BD',
    textTertiary: '#6E7684',

    accent: '#4DA3FF',
    accentLight: 'rgba(77,163,255,0.16)',

    separator: 'rgba(132,142,158,0.20)',
    border: 'rgba(132,142,158,0.18)',
    cardBorder: 'rgba(255,255,255,0.08)',

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
    tabIconSelected: '#4DA3FF',
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };

export const Elevation = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  subtle: {
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
} as const;
