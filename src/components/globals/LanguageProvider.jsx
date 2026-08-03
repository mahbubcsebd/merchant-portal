import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLangPack } from '@/lib/api/endpoints';
import { globalDefaultParams } from '@/lib/api/api';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'nl', label: 'Dutch', flag: '🇳🇱' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
];

const LanguageContext = createContext(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function LanguageProvider({ children }) {
  // Read initial language from localStorage or default to English ('en')
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });

  // Keep global request parameters in sync with active language
  useEffect(() => {
    globalDefaultParams.langId = lang;
    globalDefaultParams.langID = lang;
  }, [lang]);

  // Cached translation map from localStorage to avoid flashes of untranslated text on initial render
  const [cachedTranslationMap, setCachedTranslationMap] = useState(() => {
    try {
      const stored = localStorage.getItem(`lang_pack_${lang}`);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  // Fetch translation pack from backend for current language using React Query
  const { data: langPackResponse, isLoading: isLangLoading } = useQuery({
    queryKey: ['langPack', lang],
    queryFn: () => getLangPack({ langID: lang, langId: lang }),
    staleTime: 0, // Always fetch fresh translation pack when language changes
    refetchOnWindowFocus: false,
  });

  // Build lookup dictionary whenever language or API response changes
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

      // Persist to localStorage for offline and immediate startup use
      try {
        localStorage.setItem(`lang_pack_${lang}`, JSON.stringify(dict));
      } catch (e) {}

      return dict;
    }
    return cachedTranslationMap;
  }, [langPackResponse, lang, cachedTranslationMap]);

  // Update localStorage, global params, and cached map when language changes
  const setLanguage = (newLang) => {
    setLangState(newLang);
    localStorage.setItem('app_language', newLang);
    globalDefaultParams.langId = newLang;
    globalDefaultParams.langID = newLang;
    try {
      const stored = localStorage.getItem(`lang_pack_${newLang}`);
      setCachedTranslationMap(stored ? JSON.parse(stored) : {});
    } catch (e) {
      setCachedTranslationMap({});
    }
  };

  // Translation function with fallback
  const t = (key, fallback) => {
    return translationMap[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language: lang,
        setLanguage,
        t,
        translationMap,
        isLangLoading,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
