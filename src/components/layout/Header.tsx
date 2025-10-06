import React from 'react';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onThemeToggle?: () => void;
  onLanguageChange?: (lang: string) => void;
}

/**
 * Main application header component
 */
const Header: React.FC<HeaderProps> = ({ onThemeToggle, onLanguageChange }) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'de' ? 'en' : 'de';
    i18n.changeLanguage(newLang);
    onLanguageChange?.(newLang);
  };

  return (
    <header style={{ padding: '16px', borderBottom: '1px solid #ccc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>{t('app.title')}</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{t('app.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={toggleLanguage}>
            {i18n.language === 'de' ? '🇬🇧 EN' : '🇩🇪 DE'}
          </button>
          {onThemeToggle && (
            <button onClick={onThemeToggle}>
              🌓 Theme
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
