export const MIN_DONATION_AMOUNT = 1;
export const MAX_DONATION_AMOUNT = 999_999_999;

export const validateDonationAmount = (amount: any): boolean => {
    const value = Number(amount);
    return !Number.isNaN(value) && value >= MIN_DONATION_AMOUNT && value <= MAX_DONATION_AMOUNT;
};

export const validatePhoneNumber = (phone: any): boolean => {
    if (!phone) return false;
    const normalized = String(phone).replace(/\D/g, "").trim();
    return /^\d{10,11}$/.test(normalized);
};

export const validatePincode = (pincode: any): boolean => {
    if (pincode === undefined || pincode === null || pincode === "") return true;
    const normalized = String(pincode).replace(/\D/g, "").trim();
    return /^\d{6}$/.test(normalized);
};
