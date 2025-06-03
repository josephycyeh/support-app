import colors from './colors';

// Typography system following design hierarchy
export const typography = {
  // Primary headings (screen titles)
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    lineHeight: 34,
  },
  
  // Section titles within screens
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    lineHeight: 26,
  },
  
  // Component titles
  h3: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    lineHeight: 24,
  },
  
  // Subsection titles
  h4: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    lineHeight: 22,
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.text,
    lineHeight: 24,
  },
  
  // Secondary body text
  bodySecondary: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.textLight,
    lineHeight: 24,
  },
  
  // Small body text
  bodySmall: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textLight,
    lineHeight: 20,
  },
  
  // Caption text
  caption: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textMuted,
    lineHeight: 16,
  },
  
  // Labels (uppercase)
  label: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: colors.textMuted,
    lineHeight: 14,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  
  // Button text
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  
  // Special styles
  quote: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.text,
    lineHeight: 24,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    letterSpacing: 0.3,
  },
};

export default typography; 