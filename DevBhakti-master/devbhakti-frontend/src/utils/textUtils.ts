/**
 * Safely parses a localized name/text that might be a JSON string.
 * Returns the translation for the given language or falls back to 'en'.
 * 
 * @param value - The value to parse (string or object)
 * @param lang - The language key to use (default: 'en')
 */
export const parseLocalizedValue = (value: any, lang: string = 'en'): string => {
    if (!value) return "N/A";
    
    // If it's already an object
    if (typeof value === "object") {
        return value[lang] || value.en || value.hi || value.mr || "N/A";
    }
    
    // If it's a string, try to parse it as JSON
    try {
        const parsed = JSON.parse(value);
        if (typeof parsed === "object" && parsed !== null) {
            return parsed[lang] || parsed.en || parsed.hi || parsed.mr || "N/A";
        }
    } catch (e) {
        // Not a JSON string, return as is
    }
    
    return value;
};
