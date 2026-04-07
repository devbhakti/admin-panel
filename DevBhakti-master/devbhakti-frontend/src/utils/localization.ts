/**
 * Shared localization utility to provide type-safe access to localized fields
 * with a standardized English fallback logic.
 */

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
  lang: Language = 'en',
  fallbackLang: Language = 'en'
): string {
  if (!obj) return "";

  const localizedKey = `${field}_${lang}`;
  const fallbackKey = `${field}_${fallbackLang}`;

  // 1. Try to get the requested language value
  const value = obj[localizedKey];
  if (value && String(value).trim() !== "") {
    return value;
  }

  // 2. If lang is already the fallback, or if requested lang is empty, return fallback
  const fallbackValue = obj[fallbackKey];
  if (fallbackValue && String(fallbackValue).trim() !== "") {
    return fallbackValue;
  }

  // 3. Last resort fallback to legacy field 'name' or 'description' if they exist (for backward compatibility)
  if (obj[field] && typeof obj[field] === 'string') {
    return obj[field];
  }

  return "";
}

/**
 * Helper for localized arrays (e.g., benefits_en, benefits_hi)
 */
export function getLocalizedArray(
  obj: any,
  field: string,
  lang: Language = 'en',
  fallbackLang: Language = 'en'
): string[] {
  if (!obj) return [];

  const localizedKey = `${field}_${lang}`;
  const fallbackKey = `${field}_${fallbackLang}`;

  const value = obj[localizedKey];
  if (Array.isArray(value) && value.length > 0) {
    return value;
  }

  const fallbackValue = obj[fallbackKey];
  if (Array.isArray(fallbackValue) && fallbackValue.length > 0) {
    return fallbackValue;
  }

  if (Array.isArray(obj[field])) {
    return obj[field];
  }

  return [];
}
