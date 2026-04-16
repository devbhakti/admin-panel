"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import mr from '../locales/mr.json';

const translations = { en, hi, mr };

export type Language = 'en' | 'hi' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: string, params?: Record<string, string | number | boolean>) => string;
  tRaw: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('devbhakti_lang') as Language;
    if (savedLang && ['en', 'hi', 'mr'].includes(savedLang)) {
      setLanguageState(savedLang);
      axios.defaults.headers.common['lang'] = savedLang;
      document.documentElement.lang = savedLang;
    }
    setIsMounted(true);
  }, []);

  // Keep axios header in sync when language changed
  useEffect(() => {
    if (isMounted) {
      axios.defaults.headers.common['lang'] = language;
    }
  }, [language, isMounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('devbhakti_lang', lang);
      document.documentElement.lang = lang;
    }
  };

  const tRaw = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Fallback to key if not found
      }
    }

    return value;
  };

  const t = (key: string, params?: Record<string, string | number | boolean>) => {
    const value = tRaw(key);

    if (typeof value === 'string') {
      if (!params) {
        return value;
      }

      return value.replace(/\{\{(\w+)\}\}/g, (_, token) => {
        const replacement = params[token as keyof typeof params];
        return replacement !== undefined ? String(replacement) : `{{${token}}}`;
      });
    }

    // For non-string values, return the key as fallback
    return key;
  };

  const isRTL = false;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, t, tRaw }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
