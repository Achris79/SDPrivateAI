import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Main application navigation/sidebar component
 */
const Sidebar: React.FC = () => {
  const { t } = useTranslation();

  const navItems = [
    { key: 'home', label: t('navigation.home'), icon: '🏠' },
    { key: 'documents', label: t('navigation.documents'), icon: '📄' },
    { key: 'search', label: t('navigation.search'), icon: '🔍' },
    { key: 'settings', label: t('navigation.settings'), icon: '⚙️' },
  ];

  return (
    <aside style={{ width: '200px', borderRight: '1px solid #ccc', padding: '16px' }}>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navItems.map((item) => (
            <li key={item.key} style={{ marginBottom: '8px' }}>
              <a
                href={`#${item.key}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  textDecoration: 'none',
                  color: 'inherit',
                  borderRadius: '4px',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
