import { useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeMode } from '../types';
import { lightTheme, darkTheme } from '../styles/theme';

const THEME_STORAGE_KEY = 'sd-private-ai-theme';

/**
 * Custom hook for managing application theme
 * Optimized with useCallback and useMemo to prevent unnecessary re-renders
 */
export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // Initialize from localStorage on first render
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
      return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light';
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
      return 'light';
    }
  });

  // Persist theme changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [themeMode]);

  // Memoize toggle function to prevent recreating on every render
  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Memoize theme object to prevent unnecessary recalculations
  const theme = useMemo(
    () => (themeMode === 'light' ? lightTheme : darkTheme),
    [themeMode]
  );

  return { theme, themeMode, toggleTheme };
}
