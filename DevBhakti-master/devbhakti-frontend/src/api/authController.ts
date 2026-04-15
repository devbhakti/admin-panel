import axios from "axios";

import { API_URL } from "@/config/apiConfig";



export const sendOTP = async (data: { phone: string; name?: string; email?: string; role?: string; mode?: string }) => {

    const response = await axios.post(`${API_URL}/auth/send-otp`, data);

    return response.data;

};



export const verifyOTP = async (phone: string, otp: string, role?: string) => {

    const response = await axios.post(`${API_URL}/auth/verify-otp`, { phone, otp, role });

    return response.data;

};



export const updateProfile = async (formData: FormData) => {

    const token = localStorage.getItem("token");

    const response = await axios.put(`${API_URL}/auth/profile`, formData, {

        headers: {

            Authorization: `Bearer ${token}`,

            'Content-Type': 'multipart/form-data'

        }

    });

    return response.data;

};

export const fetchProfile = async () => {

    const token = localStorage.getItem("token");

    const response = await axios.get(`${API_URL}/auth/profile`, {

        headers: {

            Authorization: `Bearer ${token}`

        }

    });

    return response.data;

};

export const checkPhone = async (phone: string) => {
    const response = await axios.get(`${API_URL}/auth/check-phone?phone=${phone}`);
    return response.data;
};

// ✅ POST method - check if phone exists (can be global or role-specific)
export const checkPhoneOnly = async (phone: string, role?: string) => {
    const response = await axios.post(`${API_URL}/auth/check-phone`, { phone, role });
    return response.data;
};

// Alias for backward compatibility if any components still use it
export const checkPhoneGlobal = checkPhoneOnly;

// ✅ Seller portal - check if phone is registered with SELLER role
export const checkSellerPhone = async (phone: string) => {
    const response = await axios.post(`${API_URL}/auth/check-seller`, { phone });
    return response.data;
};

// ✅ Check if email is already registered (for admin create forms)
export const checkEmailExists = async (email: string, role?: string) => {
    const response = await axios.post(`${API_URL}/auth/check-email`, { email, role });
    return response.data;
};

// ✅ Temple registration - check if phone is already registered as INSTITUTION role
export const checkInstitutionPhone = async (phone: string) => {
    const response = await axios.post(`${API_URL}/auth/check-institution`, { phone });
    return response.data;
};
