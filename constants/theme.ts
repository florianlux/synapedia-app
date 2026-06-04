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
  screenBottom: 140,
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
    background: '#030406',
    backgroundSecondary: '#080D14',
    backgroundTertiary: '#101723',
    backgroundElevated: '#070B11',
    backgroundGlass: 'rgba(3,6,10,0.92)',

    // Text
    textPrimary: '#F7FAFF',
    textSecondary: '#B2BDCD',
    textTertiary: '#667386',

    // Accent
    accent: '#36A3FF',
    accentLight: 'rgba(54,163,255,0.16)',

    // Semantic
    separator: 'rgba(119,154,195,0.14)',
    border: 'rgba(127,178,255,0.13)',
    cardBorder: 'rgba(179,213,255,0.10)',

    // Risk Levels
    riskLow: '#30D158',
    riskModerate: '#FFB340',
    riskHigh: '#FF5A52',
    riskExtreme: '#D63A4A',
    riskUnknown: '#7A8494',

    // Severity (Interactions)
    severityLethal: '#D63A4A',
    severityDangerous: '#FF5A52',
    severityRisky: '#FFB340',
    severityCaution: '#FFD60A',
    severityLowRisk: '#34C759',

    // Effects
    effectPositive: '#34C759',
    effectNeutral: '#7A8494',
    effectNegative: '#FF5A52',

    // Tab Bar
    tabIconDefault: '#687486',
    tabIconSelected: '#66B8FF',
  },
  dark: {
    background: '#030406',
    backgroundSecondary: '#080D14',
    backgroundTertiary: '#101723',
    backgroundElevated: '#070B11',
    backgroundGlass: 'rgba(3,6,10,0.92)',

    textPrimary: '#F7FAFF',
    textSecondary: '#B2BDCD',
    textTertiary: '#667386',

    accent: '#36A3FF',
    accentLight: 'rgba(54,163,255,0.16)',

    separator: 'rgba(119,154,195,0.14)',
    border: 'rgba(127,178,255,0.13)',
    cardBorder: 'rgba(179,213,255,0.10)',

    riskLow: '#30D158',
    riskModerate: '#FFB340',
    riskHigh: '#FF5A52',
    riskExtreme: '#D63A4A',
    riskUnknown: '#7A8494',

    severityLethal: '#D63A4A',
    severityDangerous: '#FF5A52',
    severityRisky: '#FFB340',
    severityCaution: '#FFD60A',
    severityLowRisk: '#30D158',

    effectPositive: '#30D158',
    effectNeutral: '#7A8494',
    effectNegative: '#FF5A52',

    tabIconDefault: '#687486',
    tabIconSelected: '#66B8FF',
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
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
} as const;
