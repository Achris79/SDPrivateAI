/**
 * Theme configuration for the application
 * Supports light and dark mode
 */

export const lightTheme = {
  colors: {
    primary: '#0078d4',
    secondary: '#2b88d8',
    background: '#ffffff',
    surface: '#f3f2f1',
    text: '#323130',
    textSecondary: '#605e5c',
    border: '#d1d1d1',
    error: '#d13438',
    success: '#107c10',
    warning: '#ffaa44',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '2px',
    md: '4px',
    lg: '8px',
  },
};

export const darkTheme = {
  colors: {
    primary: '#4cc2ff',
    secondary: '#2b88d8',
    background: '#1b1a19',
    surface: '#252423',
    text: '#ffffff',
    textSecondary: '#d1d1d1',
    border: '#3b3a39',
    error: '#f1707b',
    success: '#6bb700',
    warning: '#ffaa44',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '2px',
    md: '4px',
    lg: '8px',
  },
};

export type Theme = typeof lightTheme;
