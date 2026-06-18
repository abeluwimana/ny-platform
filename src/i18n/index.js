// src/i18n/index.js
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import rw from './rw.json';

const resources = {
  en: {
    translation: en
  },
  rw: {
    translation: rw
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
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
  { code: 'en', name: 'English', flag: '🇬🇧', label: 'English' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼', label: 'Ikinyarwanda' }
];

export const defaultLanguage = 'en';

// ── LANGUAGE SWITCHER HELPER ─────────────────────────────────────

export const changeLanguage = (langCode) => {
  if (supportedLanguages.some(lang => lang.code === langCode)) {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    return true;
  }
  return false;
};

export const getCurrentLanguage = () => {
  return i18n.language || defaultLanguage;
};

export const getCurrentLanguageData = () => {
  const code = getCurrentLanguage();
  return supportedLanguages.find(lang => lang.code === code) || supportedLanguages[0];
};