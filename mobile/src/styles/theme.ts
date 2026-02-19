// Fireside Capital — Design Tokens
// MOB-008: Fixed brand colors (was #1a1a1a / #dc3545 — wrong palette)

export const colors = {
  // Fireside Brand
  primary: '#01a4ef',        // Fireside Blue (links, active states)
  cta: '#f44e24',            // Fireside Orange (CTAs, primary actions)
  success: '#81b900',        // Fireside Green (positive values)
  warning: '#ffc107',
  danger: '#dc3545',

  // Dark theme (matches web app)
  background: '#0f0f0f',
  backgroundCard: '#1a1a1a',
  backgroundElevated: '#242424',
  backgroundInput: '#2a2a2a',
  border: '#333333',
  borderSubtle: '#2a2a2a',

  // Text
  text: '#f0f0f0',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  textOnDark: '#ffffff',

  // Chart colors
  chartLine: '#01a4ef',
  chartBar: '#01a4ef',
  chartPositive: '#81b900',
  chartNegative: '#dc3545',
  chartNeutral: '#6b7280',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const radius = { sm: 6, md: 10, lg: 16, xl: 24, full: 9999 };

export const typography = {
  xs: 11, sm: 13, md: 15, lg: 17, xl: 22, xxl: 28, xxxl: 36,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Legacy compat — remove after migrating DashboardScreen + LoginScreen
export const theme = {
  colors: {
    primary: colors.primary,
    accent: colors.cta,
    success: colors.success,
    background: colors.background,
    backgroundLight: colors.backgroundCard,
    text: colors.text,
    textLight: colors.textSecondary,
    white: '#ffffff',
    border: colors.border,
    cardBackground: colors.backgroundCard,
  },
  spacing,
  borderRadius: radius,
  fontSize: typography,
  fontWeight: { regular: '400' as const, semibold: '600' as const, bold: '700' as const },
  shadow,
  button: { minHeight: 44 },
};
