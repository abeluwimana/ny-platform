// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';

const ENGLISH_LANGUAGE = 'en';

const resources = {
  en: {
    translation: en
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: ENGLISH_LANGUAGE,
    fallbackLng: ENGLISH_LANGUAGE,
    supportedLngs: [ENGLISH_LANGUAGE],
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;