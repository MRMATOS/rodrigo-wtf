"use client";

import { createContext, useContext, useEffect, useState } from "react";
import pt from "@/i18n/pt";
import en from "@/i18n/en";

type Lang = "pt" | "en";
type Translations = typeof pt | typeof en;

interface LanguageContextValue {
  lang: Lang;
  t: Translations;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "pt",
  t: pt,
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("pt");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored === "en" || stored === "pt") setLang(stored);
  }, []);

  const toggle = () => {
    setLang((prev) => {
      const next = prev === "pt" ? "en" : "pt";
      localStorage.setItem("lang", next);
      document.cookie = `lang=${next};path=/;max-age=31536000;SameSite=Lax;Secure`;
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={{ lang, t: lang === "pt" ? pt : en, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useT() {
  return useContext(LanguageContext);
}

/** @deprecated use useT() instead */
export function useLanguage() {
  return useContext(LanguageContext);
}
