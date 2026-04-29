
const isLangObject = (value) => {
  if (!value) return false;
  if (typeof value === 'object' && !Array.isArray(value)) {
    return 'en' in value || 'hi' in value || 'mr' in value ||
           'En' in value || 'Hi' in value || 'Mr' in value;
  }
  if (typeof value === 'string' && value.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return 'en' in parsed || 'hi' in parsed || 'mr' in parsed ||
               'En' in parsed || 'Hi' in parsed || 'Mr' in parsed;
      }
    } catch (e) {}
  }
  return false;
};

const localize = (data, lang = 'en') => {
  if (!data) return data;
  if (lang === 'raw') return data;
  const safeLang = (['en', 'hi', 'mr'].includes(lang) ? lang : 'en');
  if (Array.isArray(data)) {
    return data.map((item) => localize(item, safeLang));
  }
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    if (isLangObject(value)) {
      let langObj = value;
      if (typeof value === 'string') {
        try { langObj = JSON.parse(value); } catch(e) {}
      }
      const langVal = langObj[safeLang] || langObj[safeLang.charAt(0).toUpperCase() + safeLang.slice(1)];
      const getValue = (val) => (val !== undefined && val !== null && val !== '') ? val : null;
      result[key] = getValue(langVal) || 
                    getValue(langObj['en'] || langObj['En']) || 
                    getValue(langObj['hi'] || langObj['Hi']) || 
                    getValue(langObj['mr'] || langObj['Mr']);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => {
        if (item instanceof Date) return item;
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          return localize(item, safeLang);
        }
        return item;
      });
    } else if (value instanceof Date) {
      result[key] = value;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = localize(value, safeLang);
    } else {
      result[key] = value;
    }
  }
  return result;
};

// Double stringified
const userDouble = {
    name: JSON.stringify(JSON.stringify({en: "Kashi Temple Admin", hi: "", mr: ""}))
};

console.log("Input name:", userDouble.name);
console.log("Localizing double stringified:");
const localized = localize(userDouble, 'mr');
console.log(JSON.stringify(localized, null, 2));
