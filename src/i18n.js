import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import hiCommon from './locales/hi/common.json';
import teCommon from './locales/te/common.json';

// Initialize i18next with three languages: English, Hindi, and Telugu
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enCommon },
      hi: { translation: hiCommon },
      te: { translation: teCommon },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'te'],
    detection: {
      // Use localStorage to persist language between sessions
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;


