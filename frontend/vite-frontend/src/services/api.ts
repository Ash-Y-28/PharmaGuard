import axios from 'axios';

// Create an Axios instance with base configuration
const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:5003', // Base URL pointing to the Flask backend
    timeout: 10000, // Timeout for requests
});

// Example: Function to fetch drug interactions
export const fetchDrugInteractions = async (drugName: string) => {
    try {
        const response = await apiClient.get(`/drug_interactions`, {
            params: { drug_name: drugName },
        });
        return response.data; // Return the API response data
    } catch (error: any) {
        console.error('Error fetching drug interactions:', error);
        throw error.response?.data || 'An error occurred';
    }
};

export default apiClient;
