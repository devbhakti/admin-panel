/**
 * Utility to localize Prisma models with _en, _hi, _mr columns.
 */

export const localize = <T extends Record<string, any>>(
  data: T | T[],
  lang: string = 'en'
): any => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) => localize(item, lang));
  }

  const localized: any = { ...data };
  const keys = Object.keys(data);
  const suffix = `_${lang}`;

  // Find all base field names (e.g., if "name_en" exists, base is "name")
  const baseFields = new Set<string>();
  keys.forEach((key) => {
    if (key.endsWith('_en')) {
      baseFields.add(key.replace('_en', ''));
    }
  });

  baseFields.forEach((field) => {
    const valEn = data[`${field}_en`];
    const valHi = data[`${field}_hi`];
    const valMr = data[`${field}_mr`];

    // Pick requested language, fallback to English
    let selectedValue = data[`${field}${suffix}`];
    
    if (!selectedValue || (Array.isArray(selectedValue) && selectedValue.length === 0)) {
      selectedValue = valEn;
    }

    localized[field] = selectedValue;

    // Optional: Remove the individual language fields to keep response clean
    delete localized[`${field}_en`];
    delete localized[`${field}_hi`];
    delete localized[`${field}_mr`];
  });

  return localized;
};
