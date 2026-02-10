import { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Import all locale files
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import ta from '../locales/ta.json';

const LanguageContext = createContext();

const STORAGE_KEY = 'finance-dashboard-language';

// Available languages
export const languages = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  hi: { name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' }
};

// Array format for dropdowns
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' }
];

// All translations
const translations = { en, hi, es, fr, ta };

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

/**
 * Translation hook - use this in components
 * @returns {Function} t - translation function
 * 
 * Usage:
 * const { t } = useTranslation();
 * t('dashboard.title') => "Dashboard"
 * t('transactions.showing', { count: 5 }) => "Showing 5"
 */
export const useTranslation = () => {
  const { t, language } = useLanguage();
  return { t, language };
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && translations[stored]) {
        return stored;
      }
    } catch (error) {
      console.error('Failed to load language preference:', error);
    }
    return 'en';
  });

  // Persist language preference
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
      // Update document lang attribute for accessibility
      document.documentElement.lang = language;
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }, [language]);

  // Change language
  const setLanguage = useCallback((lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
    } else {
      console.warn(`Language '${lang}' not supported. Available: ${Object.keys(translations).join(', ')}`);
    }
  }, []);

  /**
   * Get nested translation by key path
   * @param {string} key - dot notation key (e.g., 'dashboard.title')
   * @param {object} params - optional interpolation params
   * @returns {string} translated text
   */
  const t = useCallback((key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            // Key not found even in English, return key itself
            console.warn(`Translation key not found: ${key}`);
            return key;
          }
        }
        break;
      }
    }

    // If still an object, return key
    if (typeof value !== 'string') {
      console.warn(`Translation key '${key}' returned non-string value`);
      return key;
    }

    // Interpolation: replace {param} with values
    if (Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : `{${paramKey}}`;
      });
    }

    return value;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t,
    languages,
    availableLanguages: Object.keys(translations)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
