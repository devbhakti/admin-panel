/**
 * JSON-based Multi-language Localization Utility
 * 
 * DB Storage format:
 *   name = {"en": "Shri Ram Mandir", "hi": "श्री राम मंदिर", "mr": "श्री राम मंदिर"}
 * 
 * Usage:
 *   localize(temple, 'hi') → { name: "श्री राम मंदिर", ... }
 * 
 * Supported langs: 'en' | 'hi' | 'mr'
 * Fallback: English if requested lang is missing
 */

export type SupportedLang = 'en' | 'hi' | 'mr' | 'raw';

export const getLang = (req: any): SupportedLang => {
  let lang = (req.query.lang as string) ||
    (req.headers['lang'] as string) ||
    (req.headers['x-lang'] as string) ||
    (req.headers['accept-language'] as string) ||
    'en';

  // Extract primary lang (e.g., 'hi-IN' -> 'hi' or 'hi, en-US' -> 'hi')
  if (lang.includes(',')) lang = lang.split(',')[0];
  if (lang.includes('-')) lang = lang.split('-')[0];
  lang = lang.trim().toLowerCase();

  return (['en', 'hi', 'mr', 'raw'].includes(lang) ? lang : 'en') as SupportedLang;
};

/**
 * Check if a value is a multilingual JSON object
 * e.g. { en: "...", hi: "...", mr: "..." }
 */
const isLangObject = (value: any): boolean => {
  if (!value) return false;
  
  let obj = value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    // Quick check: must contain at least one language key pattern
    if (!trimmed.includes('"en":') && !trimmed.includes('"hi":') && !trimmed.includes('"mr":') && 
        !trimmed.includes('"En":') && !trimmed.includes('"Hi":') && !trimmed.includes('"Mr":')) {
      return false;
    }
    
    try {
      obj = JSON.parse(trimmed);
      // Handle double-stringification
      if (typeof obj === 'string') {
        obj = JSON.parse(obj);
      }
    } catch (e) {
      return false;
    }
  }
  
  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    return 'en' in obj || 'hi' in obj || 'mr' in obj ||
           'En' in obj || 'Hi' in obj || 'Mr' in obj;
  }
  
  return false;
};

/**
 * Localize a single object or array of objects.
 * Extracts the selected language from all JSON lang fields.
 * Falls back to English if selected lang is not available.
 */
export const localize = <T extends Record<string, any>>(
  data: T | T[],
  lang: string = 'en'
): any => {
  if (!data) return data;
  
  if (lang === 'raw') return data;

  // Normalize lang — only allow en, hi, mr
  const safeLang: SupportedLang = (['en', 'hi', 'mr'].includes(lang) ? lang : 'en') as SupportedLang;

  if (Array.isArray(data)) {
    return data.map((item) => localize(item, safeLang));
  }

  const result: any = {};

  for (const [key, value] of Object.entries(data)) {
    if (isLangObject(value)) {
      // Pick the lang object (autodetect if it's a string)
      let langObj = value;
      if (typeof value === 'string') {
        try { 
          langObj = JSON.parse(value); 
          if (typeof langObj === 'string') langObj = JSON.parse(langObj);
        } catch(e) {}
      }

      // This is a multilingual field → pick selected lang, fallback to 'en'
      // Support both lowercase and Capitalized keys
      // Pick selected lang, fallback in order: en -> hi -> mr
      const langVal = langObj[safeLang] || langObj[safeLang.charAt(0).toUpperCase() + safeLang.slice(1)];
      
      const getValue = (val: any) => (val !== undefined && val !== null && val !== '') ? val : null;

      result[key] = getValue(langVal) || 
                    getValue(langObj['en'] || langObj['En']) || 
                    getValue(langObj['hi'] || langObj['Hi']) || 
                    getValue(langObj['mr'] || langObj['Mr']) ||
                    (typeof value === 'string' ? value : JSON.stringify(value)); // Final fallback if all lang keys empty
    } else if (Array.isArray(value)) {
      // Array of values
      result[key] = value.map(item => {
        if (item instanceof Date) return item;
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          // Array of objects (e.g., packages, faqs) → recurse
          return localize(item, safeLang);
        }
        return item; // Array of primitives → keep as-is
      });
    } else if (value instanceof Date) {
      // Date object → keep as-is
      result[key] = value;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Nested object (e.g., temple.poojas[0].temple) → recurse
      result[key] = localize(value, safeLang);
    } else {
      // Primitive value (string/number/boolean) → keep as-is
      result[key] = value;
    }
  }

  return result;
};

/**
 * Helper: Build a multilingual JSON object from separate language inputs.
 * Used in controllers when saving data.
 * 
 * Example:
 *   buildLangJson("Shri Ram Mandir", "श्री राम मंदिर", "श्री राम मंदिर")
 *   → { en: "Shri Ram Mandir", hi: "श्री राम मंदिर", mr: "श्री राम मंदिर" }
 */
export const buildLangJson = (
  en: any,
  hi?: any,
  mr?: any
): any => {
  return {
    en: en ?? null,
    hi: hi ?? null,
    mr: mr ?? null,
  };
};

/**
 * Helper: Build a multilingual JSON for array fields (benefits, bullets, description).
 * 
 * Example:
 *   buildLangArray(["benefit1"], ["लाभ1"], ["फायदा1"])
 *   → { en: ["benefit1"], hi: ["लाभ1"], mr: ["फायदा1"] }
 */
export const buildLangArray = (
  en: any[],
  hi?: any[],
  mr?: any[]
): { en: any[]; hi: any[]; mr: any[] } => {
  return {
    en: en ?? [],
    hi: hi ?? [],
    mr: mr ?? [],
  };
};

/**
 * Helper: Get English text from a lang JSON field.
 * Used in places where English is always needed (Shiprocket, email, notifications).
 * 
 * Example:
 *   getEnglish(temple.name) → "Shri Ram Mandir"
 */
export const getEnglish = (field: any): string => {
  if (!field) return '';
  
  if (isLangObject(field)) {
    let langObj = field;
    if (typeof field === 'string') {
      try { langObj = JSON.parse(field); } catch (e) {}
    }
    return langObj.en || langObj.En || '';
  }

  if (typeof field === 'string') return field;
  return '';
};
