// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';

const resources = {
  en: {
    translation: en
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en'],
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

// ── HELPER FUNCTIONS ──────────────────────────────────────────────

export const getTranslation = (language, key) => {
  const keys = key.split('.');
  let value = resources[language]?.translation;
  
  if (!value) {
    // Fallback to English if language not found
    value = resources.en.translation;
  }
  
  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      return key; // Return the key if translation not found
    }
  }
  return value;
};

export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇬🇧', label: 'English' }
];

export const defaultLanguage = 'en';

// ── LANGUAGE SWITCHER HELPER ─────────────────────────────────────

export const changeLanguage = () => {
  i18n.changeLanguage('en');
  return true;
};

export const getCurrentLanguage = () => {
  return i18n.language || defaultLanguage;
};

export const getCurrentLanguageData = () => {
  return supportedLanguages[0];
};