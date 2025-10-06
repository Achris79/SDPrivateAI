import React, { ReactNode } from 'react';
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
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children, onThemeToggle, onLanguageChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header onThemeToggle={onThemeToggle} onLanguageChange={onLanguageChange} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
