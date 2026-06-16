import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const captureLead = async (phone: string, source: string, metadata?: any, name?: string, email?: string) => {
    try {
        const response = await axios.post(`${API_URL}/leads/capture`, {
            phone,
            source,
            metadata,
            name,
            email
        });
        return response.data;
    } catch (error) {
        console.error("Error capturing lead:", error);
        throw error;
    }
};
