import { format, isValid, parseISO } from "date-fns";

/**
 * Safely formats a date string, object, or number.
 * Returns a fallback string if the date is invalid.
 * 
 * @param date - The date to format
 * @param formatStr - The format string (default: "PPP")
 * @param fallback - The fallback string if invalid (default: "N/A")
 */
export const safeFormat = (
    date: string | number | Date | null | undefined,
    formatStr: string = "PPP",
    fallback: string = "N/A"
): string => {
    if (!date) return fallback;

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
        
        if (isValid(dateObj)) {
            return format(dateObj, formatStr);
        }
    } catch (error) {
        console.error("Error formatting date:", error);
    }

    return fallback;
};
