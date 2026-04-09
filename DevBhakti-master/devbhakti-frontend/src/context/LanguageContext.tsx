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
  t: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial language from localStorage for instant switch on refresh
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('devbhakti_lang') as Language;
      if (savedLang && ['en', 'hi', 'mr'].includes(savedLang)) {
        // Set axios header immediately
        axios.defaults.headers.common['lang'] = savedLang;
        return savedLang;
      }
    }
    return 'en';
  });

  // Keep axios header in sync when language changed
  useEffect(() => {
    axios.defaults.headers.common['lang'] = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('devbhakti_lang', lang);
      document.documentElement.lang = lang;
    }
  };

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Fallback to key if not found
      }
    }
    
    return value || key;
  };

  const isRTL = false;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, t }}>
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
