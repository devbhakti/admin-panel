/**
 * Shared localization utility to provide type-safe access to localized fields
 * with a standardized English fallback logic.
 */

import { parseLocalizedValue } from "./textUtils";

export type Language = 'en' | 'hi' | 'mr';

/**
 * Generic helper to get a localized value from an object.
 * Field names follow the pattern: {field}_{lang} (e.g., name_en, name_hi, name_mr)
 * 
 * @param obj The object containing localized fields
 * @param field The base field name (e.g., 'name', 'description')
 * @param lang Current selected language ('en', 'hi', or 'mr')
 * @param fallbackLang The language to fallback to if the requested one is empty (Default: 'en')
 * @returns The localized string or fallback value
 */
export function getLocalized(
  obj: any,
  field: string,
  lang: Language = 'en'
): string {
  if (!obj) return "";

  const getValue = (l: string) => {
    const val = obj[`${field}_${l}`];
    return (val && String(val).trim() !== "") ? String(val) : null;
  };

  // 1. Try requested lang
  // 2. Fallback to en -> hi -> mr
  // 3. Last resort check legacy field
  return getValue(lang) || 
         getValue('en') || 
         getValue('hi') || 
         getValue('mr') || 
         (obj[field] ? parseLocalizedValue(obj[field], lang) : "");
}

/**
 * Helper for localized arrays (e.g., benefits_en, benefits_hi)
 */
export function getLocalizedArray(
  obj: any,
  field: string,
  lang: Language = 'en'
): string[] {
  if (!obj) return [];

  const getArrayValue = (val: any, l: string): string[] | null => {
    if (!val) return null;
    
    // 1. If it's already an array, use it directly (flattened response)
    if (Array.isArray(val)) return val.length > 0 ? val : null;
    
    // 2. If it's an object, look for the language key
    if (typeof val === 'object') {
       const lValue = val[l] || val['en'] || val['hi'] || val['mr'];
       return Array.isArray(lValue) ? (lValue.length > 0 ? lValue : null) : null;
    }

    // 3. If it's a string, try JSON parse
    if (typeof val === 'string' && val.trim().startsWith('[')) {
        try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed.length > 0 ? parsed : null;
        } catch (e) {}
    }

    return null;
  };

  // Check {field}_{lang} format (name_en) OR {field} object format (name: {en: ...})
  const topLevelVal = obj[`${field}_${lang}`] || obj[`${field}_en`] || obj[`${field}_hi`] || obj[`${field}_mr`];
  const nestedVal = obj[field];

  return getArrayValue(topLevelVal, lang) || 
         getArrayValue(nestedVal, lang) || 
         [];
}
