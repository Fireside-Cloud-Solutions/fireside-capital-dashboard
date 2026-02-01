export const theme = {
  colors: {
    primary: '#1a1a1a',
    accent: '#dc3545',
    success: '#28a745',
    background: '#ffffff',
    backgroundLight: '#f8f9fa',
    text: '#212529',
    textLight: '#6c757d',
    white: '#ffffff',
    border: '#e9ecef',
    cardBackground: '#ffffff',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  fontWeight: {
    regular: '400' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
  },
  button: {
    minHeight: 44,
  },
};
