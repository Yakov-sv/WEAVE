"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { translations, type Lang, type TranslationKey } from "./i18n";

type Theme = "dark" | "light";

interface AppContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const lightVars = {
  "--background": "#f5f5f7",
  "--foreground": "#1a1a2e",
  "--surface": "#ffffff",
  "--surface-hover": "#eaeaef",
  "--border": "#d8d8e0",
  "--primary": "#6366f1",
  "--primary-hover": "#4f46e5",
  "--accent": "#f59e0b",
  "--success": "#22c55e",
  "--danger": "#ef4444",
  "--muted": "#8b8b9a",
};

const darkVars = {
  "--background": "#0a0a0f",
  "--foreground": "#e8e8ea",
  "--surface": "#141419",
  "--surface-hover": "#1c1c24",
  "--border": "#2a2a35",
  "--primary": "#6366f1",
  "--primary-hover": "#818cf8",
  "--accent": "#f59e0b",
  "--success": "#22c55e",
  "--danger": "#ef4444",
  "--muted": "#6b7280",
};

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ru");
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const root = document.documentElement;
    const vars = theme === "light" ? lightVars : darkVars;
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "ru" ? "en" : "ru"));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const t = useCallback((key: TranslationKey) => {
    return translations[lang][key] || translations.ru[key] || key;
  }, [lang]);

  return (
    <AppContext.Provider value={{ lang, setLang, toggleLang, t, theme, toggleTheme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
