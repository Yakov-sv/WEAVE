"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { translations, type Lang, type TranslationKey } from "./i18n";

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ru");

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "ru" ? "en" : "ru"));
  }, []);

  const t = useCallback((key: TranslationKey) => {
    return translations[lang][key] || translations.ru[key] || key;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
