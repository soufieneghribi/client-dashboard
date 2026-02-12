import axios from 'axios';
import { getImageUrl, handleImageError as imageErrorHandler } from '../utils/imageHelper';

// ==================== CONFIGURATION ====================

export const BASE_URL = 'https://tn360-back-office-122923924979.europe-west1.run.app';
export const API_BASE_URL = `${BASE_URL}/api/v1`;

const API_TIMEOUT = 15000;

// Google Maps API Key
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// ==================== AXIOS INSTANCE SETUP ====================

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Helper to get token (from localStorage or Cookies)
const getAuthToken = () => {
  try {
    const localToken = localStorage.getItem('token');
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    return localToken || cookieToken || null;
  } catch (e) {
    return null;
  }
};

// ==================== INTERCEPTORS ====================

// Request Interceptor: Attach Auth Token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the full error for debugging
    console.error("❌ API Error Interceptor:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('client_id');
    }

    const message = handleApiError(error);
    error.formattedMessage = message;

    return Promise.reject(error);
  }
);

// ==================== API ERROR HANDLER ====================

export const handleApiError = (error) => {
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Délai d\'attente dépassé. Veuillez réessayer.';
  }

  if (error.response?.status === 401) {
    return 'Session expirée. Veuillez vous reconnecter.';
  }

  if (error.response?.status === 403) {
    return 'Accès non autorisé.';
  }

  if (error.response?.status === 404) {
    return 'Ressource non trouvée.';
  }

  if (error.response?.status === 422) {
    const validationErrors = error.response.data.errors;
    if (Array.isArray(validationErrors)) {
      return validationErrors[0]?.message || validationErrors[0] || 'Erreur de validation.';
    } else if (typeof validationErrors === 'object') {
      const firstKey = Object.keys(validationErrors)[0];
      return validationErrors[firstKey][0] || 'Erreur de validation.';
    }
    return 'Erreur de validation des données.';
  }

  if (error.response?.status === 429) {
    return 'Trop de requêtes. Veuillez patienter un moment.';
  }

  if (error.response?.status >= 500) {
    return 'Erreur serveur. Veuillez réessayer plus tard.';
  }

  return error.response?.data?.message || error.message || 'Une erreur est survenue.';
};

// ==================== API SERVICES ====================

export const authService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (data) => apiClient.post('/auth/register', data),
  getProfile: () => apiClient.get('/customer/info1'),
  updateProfile: (data) => apiClient.post('/auth/profile/update', data),
  changePassword: (data) => apiClient.post('/auth/change-password', data),
  logout: () => apiClient.post('/auth/logout'),
  verifyEmail: (data) => apiClient.post('/auth/verify-email', data),
  resendOtp: (data) => apiClient.post('/auth/resend-otp', data),
  checkVerificationStatus: () => apiClient.post('/auth/check-verification-status'),
};

export const productService = {
  getAll: (params) => apiClient.get('/products/allproducts', { params }),
  getByType: (typeId, params) => apiClient.get(`/products/type/${typeId}`, { params }),
  getById: (id) => apiClient.get(`/products/product/${id}`),
  getPopular: () => apiClient.get('/products/popular'),
  getRecommended: () => apiClient.get('/products/recommended'),
  search: (query) => apiClient.get('/products/search', { params: { query } }),
};

export const categoryService = {
  getAll: () => apiClient.get('/categories/article-types'),
  getAttributes: (id) => apiClient.get(`/categories/article-types/${id}/attributes`),
};

export const bannerService = {
  getAll: () => apiClient.get('/banners/get-all'),
};

export const promotionService = {
  getByClient: (clientId) => apiClient.get(`/promotions/client/${clientId}`),
  getAll: () => apiClient.get('/promotions'),
};

export const dealService = {
  getUnified: (clientId) => apiClient.get('/deals', { params: { client_id: clientId } }),
  getSpecific: (type, clientId) => {
    const endpoints = {
      spend: '/dealDepense',
      brand: '/dealMarque',
      frequency: '/dealFrequence',
      birthday: '/dealAnniversaire'
    };
    return apiClient.get(`${endpoints[type]}/clientId/${clientId}`);
  },
  transfer: (dealId) => apiClient.post(`/customer/deal-objective/${dealId}/complete`),
};

export const wishlistService = {
  getAll: () => apiClient.get('/customer/wishlist'),
  toggle: (productId) => apiClient.post('/customer/wishlist/toggle', { product_id: productId }),
  check: (productId) => apiClient.get(`/customer/wishlist/check/${productId}`),
};

export const orderService = {
  create: (data) => apiClient.post('/orders', data),
  prepare: (data) => apiClient.post('/customer/order/prepare', data),
  place: (data) => apiClient.post('/customer/order/place', data),
  getList: () => apiClient.get('/customer/order/list'),
  getDetails: (id) => apiClient.get(`/customer/order/order_details/${id}`),
};

export const cadeauService = {
  getAll: () => apiClient.get('/cadeaux'),
  getByClient: (clientId) => apiClient.get(`/cadeaux/client/${clientId}/all`),
  acquire: (id) => apiClient.post(`/cadeaux/${id}/acquire`),
};

export const creditService = {
  getRules: () => apiClient.get('/credit/rules'),
  simulate: (data) => apiClient.post('/credit/simulate', data),
  checkEligibility: (data) => apiClient.post('/credit/eligibility', data),
  createDossier: (data) => apiClient.post('/credit/dossier', data),
  getDossiers: () => apiClient.get('/credit/dossiers'),
  uploadDocument: (formData) => apiClient.post('/credit/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const storeService = {
  getAll: () => apiClient.get('/stores'),
  getNearby: (params) => apiClient.get('/stores/nearby', { params }),
  getById: (id) => apiClient.get(`/stores/${id}`),
};

export const deliveryService = {
  getAvailableModes: () => apiClient.get('/delivery/available-modes'),
  calculateFee: (params) => apiClient.post('/delivery/calculate-fee', params),
};

export const claimService = {
  getAll: () => apiClient.get('/claims'),
  getTypes: () => apiClient.get('/claims/types'),
  create: (data) => apiClient.post('/claims', data),
  getById: (id) => apiClient.get(`/claims/${id}`),
  addMessage: (id, data) => apiClient.post(`/claims/${id}/messages`, data),
  addFeedback: (id, data) => apiClient.post(`/claims/${id}/feedback`, data),
};

export const recruitmentService = {
  getJobs: (params) => apiClient.get('/recrutement/jobs', { params }),
  getJobDetails: (slug) => apiClient.get(`/recrutement/jobs/${slug}`),
  apply: (formData) => apiClient.post('/recrutement/apply', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const blogService = {
  getAll: (params) => apiClient.get('/blogs', { params }),
  getFeatured: () => apiClient.get('/blogs/featured'),
  getDetails: (idOrSlug) => apiClient.get(`/blogs/${idOrSlug}`),
};


// ==================== LEGACY CONSTANTS (DEPRECATED but REQUIRED) ====================
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    GOOGLE_LOGIN: `${API_BASE_URL}/auth/google-login`,
    GOOGLE_REGISTER: `${API_BASE_URL}/auth/google/register`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/password/email`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/password/reset`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
    PROFILE_UPDATE: `${API_BASE_URL}/auth/profile/update`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
    RESEND_OTP: `${API_BASE_URL}/auth/resend-otp`,
    CHECK_VERIFICATION: `${API_BASE_URL}/auth/check-verification-status`,
  },
  USER: {
    PROFILE: `${API_BASE_URL}/customer/info1`,
    ORDERS: `${API_BASE_URL}/customer/order/list`,
    UPDATE_CAGNOTTE: `${API_BASE_URL}/customer/update-cagnotte`,
  },
  PRODUCTS: {
    ALL: `${API_BASE_URL}/products/allproducts`,
    BY_TYPE: (id) => `${API_BASE_URL}/products/type/${id}`,
    BY_ID: (id) => `${API_BASE_URL}/products/product/${id}`,
    POPULAR: `${API_BASE_URL}/products/popular`,
    RECOMMENDED: `${API_BASE_URL}/products/recommended`,
    SEARCH: `${API_BASE_URL}/products/search`,
  },
  CATEGORIES: {
    ALL: `${API_BASE_URL}/categories/article-types`,
    ATTRIBUTES: (id) => `${API_BASE_URL}/categories/article-types/${id}/attributes`,
  },
  BANNERS: {
    ALL: `${API_BASE_URL}/banners/get-all`,
  },
  PROMOTIONS: {
    ALL: `${API_BASE_URL}/promotions`,
    BY_CLIENT: (clientId) => `${API_BASE_URL}/promotions/client/${clientId}`,
  },
  STORES: {
    ALL: `${API_BASE_URL}/stores`,
    NEARBY: `${API_BASE_URL}/stores/nearby`,
  },
  DELIVERY: {
    AVAILABLE_MODES: `${API_BASE_URL}/delivery/available-modes`,
    CALCULATE_FEE: `${API_BASE_URL}/delivery/calculate-fee`,
  },
  ENSEIGNES: {
    ALL: `${API_BASE_URL}/enseignes`,
  },
  LOYALTY: {
    GET: `${API_BASE_URL}/customer/loyalty-card`,
    GENERATE: `${API_BASE_URL}/customer/loyalty-card/generate`,
    HISTORY: `${API_BASE_URL}/customer/loyalty-card/history`,
    REPORT_LOST: `${API_BASE_URL}/customer/loyalty-card/report-lost`,
  },
  WISHLIST: {
    ALL: `${API_BASE_URL}/customer/wishlist`,
    ADD: `${API_BASE_URL}/customer/wishlist/add`,
    REMOVE: `${API_BASE_URL}/customer/wishlist/remove`,
    TOGGLE: `${API_BASE_URL}/customer/wishlist/toggle`,
    CHECK: (id) => `${API_BASE_URL}/customer/wishlist/check/${id}`,
    BATCH_CHECK: `${API_BASE_URL}/customer/wishlist/check`,
    CLEAR: `${API_BASE_URL}/customer/wishlist/clear`,
    COUNT: `${API_BASE_URL}/customer/wishlist/count`,
  },
  RECIPES: {
    ALL: `${API_BASE_URL}/recipes`,
    FEATURED: `${API_BASE_URL}/recipes/featured`,
    BY_ID: (id) => `${API_BASE_URL}/recipes/${id}`,
  },
  CREDIT: {
    RULES: `${API_BASE_URL}/credit/rules`,
    SIMULATE: `${API_BASE_URL}/credit/simulate`,
    ELIGIBILITY: `${API_BASE_URL}/credit/eligibility`,
    CREATE_DOSSIER: `${API_BASE_URL}/credit/dossier`,
    LIST_DOSSIERS: `${API_BASE_URL}/credit/dossiers`,
    UPLOAD_DOCUMENT: `${API_BASE_URL}/credit/upload`,
  },
  ORDERS: {
    LIST: `${API_BASE_URL}/customer/order/list`,
    PLACE: `${API_BASE_URL}/customer/order/place`,
    PREPARE: `${API_BASE_URL}/customer/order/prepare`,
    BY_ID: (id) => `${API_BASE_URL}/customer/order/order_details/${id}`,
  },
  OFFERS: {
    ALL: `${API_BASE_URL}/offre`,
    BY_ID: (id) => `${API_BASE_URL}/offre/${id}`,
  },
  DEALS: {
    FREQUENCE: {
      ALL: `${API_BASE_URL}/dealFrequence`,
      BY_CLIENT: (id) => `${API_BASE_URL}/dealFrequence/clientId/${id}`,
    },
    DEPENSE: {
      BY_CLIENT: (id) => `${API_BASE_URL}/dealDepense/clientId/${id}`,
    },
    MARQUE: {
      BY_CLIENT: (id) => `${API_BASE_URL}/dealMarque/clientId/${id}`,
    },
    ANNIVERSAIRE: {
      ALL: `${API_BASE_URL}/dealAnniversaire`,
      BY_CLIENT: (id) => `${API_BASE_URL}/dealAnniversaire/clientId/${id}`,
    },
  },
  FREE_PRODUCTS: {
    ALL: `${API_BASE_URL}/free-products`,
    BY_ID: (id) => `${API_BASE_URL}/free-products/${id}`,
    RESERVE: (id) => `${API_BASE_URL}/free-products/${id}/reserve`,
    MY_RESERVATIONS: `${API_BASE_URL}/free-products/my-reservations/list`,
  },
  CADEAUX: {
    ALL: `${API_BASE_URL}/cadeaux`,
    BY_CLIENT: (clientId) => `${API_BASE_URL}/cadeaux/client/${clientId}/all`,
    ACQUIRE: (id) => `${API_BASE_URL}/cadeaux/${id}/acquire`,
    MY_ACQUISITIONS: `${API_BASE_URL}/cadeaux/my-acquisitions/list`,
  },
  CLAIMS: {
    ALL: `${API_BASE_URL}/claims`,
    TYPES: `${API_BASE_URL}/claims/types`,
    CREATE: `${API_BASE_URL}/claims`,
    BY_ID: (id) => `${API_BASE_URL}/claims/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/claims/${id}`,
    DELETE: (id) => `${API_BASE_URL}/claims/${id}`,
    MESSAGES: (id) => `${API_BASE_URL}/claims/${id}/messages`,
    FEEDBACK: (id) => `${API_BASE_URL}/claims/${id}/feedback`,
  },
  CODE_PROMO: {
    ALL: `${API_BASE_URL}/promo-codes`,
    BY_ID: (id) => `${API_BASE_URL}/promo-codes/${id}`,
    RESERVE: (id) => `${API_BASE_URL}/promo-codes/${id}/reserve`,
    MY_CODES: `${API_BASE_URL}/promo-codes/my`,
  },
  RECRUTEMENT: {
    JOBS: `${API_BASE_URL}/recrutement/jobs`,
    JOB_DETAILS: (slug) => `${API_BASE_URL}/recrutement/jobs/${slug}`,
    APPLY: `${API_BASE_URL}/recrutement/apply`,
  },
  BLOG: {
    ALL: `${API_BASE_URL}/blogs`,
    FEATURED: `${API_BASE_URL}/blogs/featured`,
    DETAILS: (idOrSlug) => `${API_BASE_URL}/blogs/${idOrSlug}`,
  },
};


// ==================== EXPORTS ====================

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const getAuthHeadersBinary = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const getAuthHeadersMultipart = () => {
  const token = localStorage.getItem('token');
  return token ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  } : {};
};

// Re-export core utilities
export { getImageUrl };
export const handleImageError = imageErrorHandler;

// Default export MUST be the axios instance for backward compatibility
export default apiClient;
