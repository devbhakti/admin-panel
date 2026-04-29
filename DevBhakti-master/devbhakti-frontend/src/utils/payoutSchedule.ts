export const PAYOUT_DAYS = [1, 15];

/**
 * Returns true only on the allowed payout days of the month.
 */
export const isPayoutAllowed = (date: Date = new Date()): boolean => {
    const day = date.getDate();
    return PAYOUT_DAYS.includes(day);
};

/**
 * Returns the next allowed payout date (used for UI messages).
 */
export const nextPayoutDate = (from: Date = new Date()): Date => {
    const day = from.getDate();
    const month = from.getMonth(); // 0-based
    const year = from.getFullYear();

    // Find the next available payout day in the current month
    const nextDay = PAYOUT_DAYS.find(d => d > day);

    if (nextDay) {
        return new Date(year, month, nextDay);
    }
    
    // If no more payout days this month, return the first payout day of the next month
    return new Date(year, month + 1, PAYOUT_DAYS[0]);
};

