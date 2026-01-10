import axios from 'axios';

const BASE_URL = 'https://tn360-back-office-122923924979.europe-west1.run.app';
const API_BASE_URL = `${BASE_URL}/api/v1`;

class DealApiService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        // Add auth token interceptor
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    /**
     * Fetches all deals using the unified V2 endpoint
     * @param {number} clientId - Client ID
     * @param {string} type - Deal type filter: 'all', 'spend', 'brand', 'frequency', 'birthday'
     * @returns {Promise} Response with deals data
     */
    async getClientDeals(clientId, type = 'all') {
        const response = await this.client.get('/deals', {
            params: {
                client_id: clientId,
                type: type
            }
        });
        return response.data;
    }

    /**
     * Transfer deal earnings to cagnotte
     * @param {number} dealId - Client Deal ID
     * @returns {Promise} Transfer response
     */
    async transferDeal(dealId) {
        const response = await this.client.post(`/customer/deal-objective/${dealId}/complete`);
        return response.data;
    }
}

export const dealApi = new DealApiService();
