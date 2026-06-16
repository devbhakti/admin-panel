import axios from 'axios';
import { API_URL } from '@/config/apiConfig';

const getAdminToken = () => localStorage.getItem("admin_token") || localStorage.getItem("staff_token");

export const fetchAllLeadsAdmin = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    source?: string;
}) => {
    const token = getAdminToken();
    const response = await axios.get(`${API_URL}/admin/leads`, {
        headers: { Authorization: `Bearer ${token}` },
        params
    });
    return response.data;
};

export const updateLeadStatusAdmin = async (id: string, status: string) => {
    const token = getAdminToken();
    const response = await axios.patch(`${API_URL}/admin/leads/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteLeadAdmin = async (id: string) => {
    const token = getAdminToken();
    const response = await axios.delete(`${API_URL}/admin/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
