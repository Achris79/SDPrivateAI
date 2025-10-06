import { useState, useEffect } from 'react';
import { ThemeMode } from '../types';
import { lightTheme, darkTheme } from '../styles/theme';

/**
 * Custom hook for managing application theme
 */
export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme) {
      setThemeMode(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  return { theme, themeMode, toggleTheme };
}
