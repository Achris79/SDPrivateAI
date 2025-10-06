import React, { ReactNode, useMemo } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
  onThemeToggle?: () => void;
  onLanguageChange?: (lang: string) => void;
}

/**
 * Main application layout component
 * Provides consistent structure with header, sidebar, and content area
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const MainLayout: React.FC<MainLayoutProps> = React.memo(({ children, onThemeToggle, onLanguageChange }) => {
  // Memoize styles to prevent recalculation
  const containerStyle = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
  }), []);

  const contentWrapperStyle = useMemo(() => ({
    display: 'flex',
    flex: 1,
    overflow: 'hidden' as const,
  }), []);

  const mainStyle = useMemo(() => ({
    flex: 1,
    padding: '24px',
    overflow: 'auto' as const,
  }), []);

  return (
    <div style={containerStyle}>
      <Header onThemeToggle={onThemeToggle} onLanguageChange={onLanguageChange} />
      <div style={contentWrapperStyle}>
        <Sidebar />
        <main style={mainStyle}>
          {children}
        </main>
      </div>
    </div>
  );
});

MainLayout.displayName = 'MainLayout';

export default MainLayout;
