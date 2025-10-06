import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MainLayout from './components/layout/MainLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useTheme } from './hooks/useTheme';
import { initDatabase } from './services/database';
import { logger } from './errors';
import './App.css';

function App() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Initialize database on app start with proper error handling
    const initApp = async () => {
      try {
        await initDatabase();
        logger.info('Application initialized successfully');
      } catch (error) {
        logger.log(
          error instanceof Error ? error : new Error('Unknown error during initialization'),
          { component: 'App', action: 'initDatabase' }
        );
      }
    };

    initApp();
  }, []);

  // Apply theme colors to root element
  useEffect(() => {
    document.documentElement.style.setProperty('--bg-color', theme.colors.background);
    document.documentElement.style.setProperty('--text-color', theme.colors.text);
  }, [theme]);

  // Memoize content style to prevent unnecessary recalculations
  const contentStyle = useMemo(() => ({
    padding: '24px',
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  }), [theme.colors.text, theme.colors.background]);

  return (
    <ErrorBoundary>
      <MainLayout onThemeToggle={toggleTheme}>
        <div style={contentStyle}>
          <h2>{t('common.loading')}</h2>
          <p>Welcome to SD Private AI!</p>
          <p>This is the basic structure. Components will be added in future iterations.</p>
          
          <div style={{ marginTop: '24px' }}>
            <h3>Next Steps:</h3>
            <ul>
              <li>Configure Syncfusion license key</li>
              <li>Implement document management features</li>
              <li>Add vector search functionality</li>
              <li>Integrate AI models</li>
            </ul>
            <p>See TODO.md for complete task list.</p>
          </div>
        </div>
      </MainLayout>
    </ErrorBoundary>
  );
}

export default App;

