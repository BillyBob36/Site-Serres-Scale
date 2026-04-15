"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import frDict from "./fr.json";
import enDict from "./en.json";

type Dict = Record<string, string>;
type Lang = "fr" | "en";

const dictionaries: Record<Lang, Dict> = { fr: frDict, en: enDict };
const AVAILABLE_LANGS: { code: Lang; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
];

const STORAGE_KEY = "landing-gen-lang";

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  availableLangs: typeof AVAILABLE_LANGS;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "fr",
  setLang: () => {},
  t: (k) => k,
  availableLangs: AVAILABLE_LANGS,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === "fr" || stored === "en")) {
      setLangState(stored as Lang);
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (key: string): string => dictionaries[lang]?.[key] ?? dictionaries.fr[key] ?? key,
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t, availableLangs: AVAILABLE_LANGS }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}

export { AVAILABLE_LANGS };
export type { Lang };
