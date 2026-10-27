import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getLangPack } from '@/lib/api/endpoints';
import { globalDefaultParams } from '@/lib/api/api';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'nl', label: 'Dutch', flag: '🇳🇱' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
];

const FLAG_MAP = {
  en: '🇺🇸',
  nl: '🇳🇱',
  fr: '🇫🇷',
  es: '🇪🇸',
  de: '🇩🇪',
  it: '🇮🇹',
  pt: '🇵🇹',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ar: '🇸🇦',
  hi: '🇮🇳',
};

export const getDynamicSupportedLanguages = (welcomeData) => {
  const list = welcomeData?.metaData?.LANGUAGELIST;
  if (Array.isArray(list) && list.length > 0) {
    return list.map((item) => {
      const code = String(item.id).toLowerCase().trim();
      return {
        code,
        label: item.title,
        flag: FLAG_MAP[code] || '🌐',
      };
    });
  }
  return SUPPORTED_LANGUAGES;
};

const LanguageContext = createContext(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function LanguageProvider({ children }) {
  const queryClient = useQueryClient();
  const welcomeData = queryClient.getQueryData(['welcome']);

  const supportedLanguages = useMemo(() => {
    return getDynamicSupportedLanguages(welcomeData);
  }, [welcomeData]);

  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });

  useEffect(() => {
    globalDefaultParams.langId = lang;
    globalDefaultParams.langID = lang;
  }, [lang]);

  const [cachedTranslationMap, setCachedTranslationMap] = useState(() => {
    try {
      const stored = localStorage.getItem(`lang_pack_${lang}`);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  const { data: langPackResponse, isLoading: isLangLoading } = useQuery({
    queryKey: ['langPack', lang],
    queryFn: () => getLangPack({ langID: lang, langId: lang }),
    staleTime: 0, 
    refetchOnWindowFocus: false,
  });

  const cleanAsterisks = (val) => {
    if (typeof val === "string") {
      return val.replace(/[\s*]+$/, "").trim();
    }
    return val;
  };

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
          dict[item.labelId] = cleanAsterisks(item.labelValue);
        }
      });

      try {
        localStorage.setItem(`lang_pack_${lang}`, JSON.stringify(dict));
      } catch (e) {}

      return dict;
    }
    return cachedTranslationMap;
  }, [langPackResponse, lang, cachedTranslationMap]);

  const setLanguage = (newLang) => {
    setLangState(newLang);
    localStorage.setItem("app_language", newLang);
    globalDefaultParams.langId = newLang;
    globalDefaultParams.langID = newLang;
    try {
      const stored = localStorage.getItem(`lang_pack_${newLang}`);
      setCachedTranslationMap(stored ? JSON.parse(stored) : {});
    } catch (e) {
      setCachedTranslationMap({});
    }
  };

  const t = (key, fallback) => {
    const raw =
      translationMap[key] !== undefined
        ? translationMap[key]
        : fallback !== undefined
          ? fallback
          : key;
    return cleanAsterisks(raw);
  };

  return (
    <LanguageContext.Provider
      value={{
        language: lang,
        setLanguage,
        t,
        translationMap,
        isLangLoading,
        supportedLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
