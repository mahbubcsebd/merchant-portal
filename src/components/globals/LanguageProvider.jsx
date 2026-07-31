import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLangPack } from '@/lib/api/endpoints';

const LanguageContext = createContext(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function LanguageProvider({ children }) {
  // Read initial language from localStorage or default to English
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });

  // Cached translation map from localStorage to avoid flashes of untranslated text on load
  const [cachedTranslationMap, setCachedTranslationMap] = useState(() => {
    try {
      const stored = localStorage.getItem(`lang_pack_${lang}`);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  // Fetch translation packs from backend for current language
  const { data: langPackResponse } = useQuery({
    queryKey: ['langPack', lang],
    queryFn: () => getLangPack({ langID: lang, langId: lang }),
    staleTime: 10 * 60 * 1000, // 10 minutes stale time
  });

  // Build lookup dictionary whenever language or response changes
  const translationMap = useMemo(() => {
    const languageObj = langPackResponse?.language;
    const langData =
      languageObj?.[lang]?.data ||
      languageObj?.[lang.toLowerCase()]?.data ||
      (languageObj && Object.values(languageObj)[0]?.data);

    if (langData && Array.isArray(langData)) {
      const dict = {};
      langData.forEach((item) => {
        if (item.labelId) {
          dict[item.labelId] = item.labelValue;
        }
      });

      // Persist to localStorage for offline/immediate startup use
      try {
        localStorage.setItem(`lang_pack_${lang}`, JSON.stringify(dict));
      } catch (e) {}

      return dict;
    }
    return cachedTranslationMap;
  }, [langPackResponse, lang, cachedTranslationMap]);

  // Update localStorage and cached map when language changes
  const setLanguage = (newLang) => {
    setLangState(newLang);
    localStorage.setItem('app_language', newLang);
    try {
      const stored = localStorage.getItem(`lang_pack_${newLang}`);
      setCachedTranslationMap(stored ? JSON.parse(stored) : {});
    } catch (e) {
      setCachedTranslationMap({});
    }
  };

  // Translation function
  const t = (key, fallback) => {
    return translationMap[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language: lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
