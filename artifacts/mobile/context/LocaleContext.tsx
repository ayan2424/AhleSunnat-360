import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  LANGUAGE_OPTIONS,
  TRANSLATIONS,
  type Language,
  type TranslationKey,
  t as translateFn,
} from "@/utils/translations";

const STORAGE_KEY = "@qaza_language";

interface LocaleContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

const LocaleContext = createContext<LocaleContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key as string,
  isRTL: false,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val && val in TRANSLATIONS) {
        setLanguageState(val as Language);
      }
      setLoaded(true);
    });
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang);
  }

  const langOption = LANGUAGE_OPTIONS.find((l) => l.code === language);
  const isRTL = langOption?.rtl ?? false;

  function t(key: TranslationKey): string {
    return translateFn(language, key);
  }

  if (!loaded) return null;

  return (
    <LocaleContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
