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


export const exportLeadsAdmin = async (filters?: {
    search?: string;
    status?: string;
    source?: string;
}) => {
    try {
        const token = getAdminToken();
        
        // Query params build karein
        const queryParams = new URLSearchParams();
        if (filters?.search) queryParams.append('search', filters.search);
        if (filters?.status && filters.status !== 'all') queryParams.append('status', filters.status);
        if (filters?.source && filters.source !== 'all') queryParams.append('source', filters.source);

        // API call with blob response type (for file download)
        const response = await axios.get(
            `${API_URL}/admin/leads/export?${queryParams.toString()}`,
            {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Accept': 'text/csv'
                },
                responseType: 'blob' // Important: File download ke liye
            }
        );

        // Create CSV file download
        const blob = new Blob([response.data], { 
            type: 'text/csv;charset=utf-8;' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Filename with current date
        const date = new Date().toISOString().split('T')[0];
        link.download = `leads_export_${date}.csv`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error: any) {
        console.error("Error exporting leads:", error);
        throw error;
    }
};