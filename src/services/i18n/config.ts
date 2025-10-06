import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const translationEN = {
  app: {
    title: 'SD Private AI',
    subtitle: 'Your Personal Offline AI Knowledge Base'
  },
  navigation: {
    home: 'Home',
    documents: 'Documents',
    search: 'Search',
    settings: 'Settings'
  },
  actions: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    upload: 'Upload',
    download: 'Download',
    search: 'Search'
  },
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    noData: 'No data available'
  }
};

const translationDE = {
  app: {
    title: 'SD Private AI',
    subtitle: 'Ihre Persönliche Offline-KI-Wissensdatenbank'
  },
  navigation: {
    home: 'Startseite',
    documents: 'Dokumente',
    search: 'Suche',
    settings: 'Einstellungen'
  },
  actions: {
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    create: 'Erstellen',
    upload: 'Hochladen',
    download: 'Herunterladen',
    search: 'Suchen'
  },
  common: {
    loading: 'Lädt...',
    error: 'Ein Fehler ist aufgetreten',
    success: 'Erfolgreich',
    noData: 'Keine Daten verfügbar'
  }
};

const resources = {
  en: {
    translation: translationEN
  },
  de: {
    translation: translationDE
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'de', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
