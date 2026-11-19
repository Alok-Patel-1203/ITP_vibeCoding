import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('salon_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('salon_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'gu' : 'en'));
  };

  const setLanguage = (newLang) => {
    if (newLang === 'en' || newLang === 'gu') {
      setLang(newLang);
    }
  };

  /**
   * Helper function to fetch nested translation keys: t('common.salonName')
   */
  const t = (keyPath, fallback = '') => {
    if (!keyPath) return fallback;
    const segments = keyPath.split('.');
    let current = translations[lang] || translations.en;

    for (const segment of segments) {
      if (current && typeof current === 'object' && segment in current) {
        current = current[segment];
      } else {
        // Fallback to English dictionary if key missing in Gujarati
        let enFallback = translations.en;
        for (const enSegment of segments) {
          if (enFallback && typeof enFallback === 'object' && enSegment in enFallback) {
            enFallback = enFallback[enSegment];
          } else {
            return fallback || keyPath;
          }
        }
        return enFallback || fallback || keyPath;
      }
    }

    return typeof current === 'string' ? current : (fallback || keyPath);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
