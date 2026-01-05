// ==================== CONFIGURATION ====================

const BASE_URL = 'https://tn360-back-office-122923924979.europe-west1.run.app';
const API_BASE_URL = `${BASE_URL}/api/v1`;

// Configuration du timeout
const API_TIMEOUT = 15000;

// Google Maps API Key
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// ==================== API ENDPOINTS ====================

export const API_ENDPOINTS = {
  // ==================== AUTHENTICATION ====================
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
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
    RESEND_OTP: `${API_BASE_URL}/auth/resend-otp`,
    CHECK_VERIFICATION_STATUS: `${API_BASE_URL}/auth/check-verification-status`,
  },

  // ==================== USER MANAGEMENT ====================
  USER: {
    PROFILE: `${API_BASE_URL}/customer/info1`,
    UPDATE_CAGNOTTE: `${API_BASE_URL}/customer/update-cagnotte`,
    ORDERS: `${API_BASE_URL}/customer/order/list`,
  },

  // ==================== PRODUCTS ====================
  PRODUCTS: {
    ALL: `${API_BASE_URL}/products/allproducts`,
    BY_TYPE: (id_type) => `${API_BASE_URL}/products/type/${id_type}`,
    BY_ID: (idProduct) => `${API_BASE_URL}/products/product/${idProduct}`,
    POPULAR: `${API_BASE_URL}/products/popular`,
    RECOMMENDED: `${API_BASE_URL}/products/recommended`,
    SEARCH: `${API_BASE_URL}/products/search`,
  },

  // ==================== CATEGORIES ====================
  CATEGORIES: {
    ALL: `${API_BASE_URL}/categories/article-types`,
    BY_ID: (id) => `${API_BASE_URL}/categories/${id}`,
  },

  // ==================== ENSEIGNES ====================
  ENSEIGNES: {
    ALL: `${API_BASE_URL}/enseignes`,
    DEFAULT: `${API_BASE_URL}/enseignes/default`,
  },

  // ==================== DEALS ====================
  DEALS: {
    DEPENSE: {
      ALL: `${API_BASE_URL}/dealDepense`,
      BY_CLIENT: (clientId) => `${API_BASE_URL}/dealDepense/clientId/${clientId}`,
      TRANSFER: (dealId) => `${API_BASE_URL}/dealDepense/${dealId}/transfer-cagnotte`,
    },
    MARQUE: {
      ALL: `${API_BASE_URL}/dealMarque`,
      BY_CLIENT: (clientId) => `${API_BASE_URL}/dealMarque/clientId/${clientId}`,
      TRANSFER: (dealId) => `${API_BASE_URL}/dealMarque/${dealId}/transfer-cagnotte`,
    },
    FREQUENCE: {
      ALL: `${API_BASE_URL}/dealFrequence`,
      BY_CLIENT: (clientId) => `${API_BASE_URL}/dealFrequence/clientId/${clientId}`,
      TRANSFER: (dealId) => `${API_BASE_URL}/dealFrequence/${dealId}/transfer-cagnotte`,
    },
    ANNIVERSAIRE: {
      ALL: `${API_BASE_URL}/dealAnniversaire`,
      BY_CLIENT: (clientId) => `${API_BASE_URL}/dealAnniversaire/clientId/${clientId}`,
      TRANSFER: (dealId) => `${API_BASE_URL}/dealAnniversaire/${dealId}/transfer-cagnotte`,
    },
  },

  // ==================== OFFERS ====================
  OFFERS: {
    ALL: `${API_BASE_URL}/offre`,
    BY_ID: (id) => `${API_BASE_URL}/offre/${id}`,
  },

  // ==================== PROMOTIONS ====================
  PROMOTIONS: {
    BY_CLIENT: (clientId) => `${API_BASE_URL}/promotions/client/${clientId}`,
  },

  // ==================== BANNERS ====================
  BANNERS: {
    ALL: `${API_BASE_URL}/banners/get-all`,
    BY_ID: (id) => `${API_BASE_URL}/banners/${id}`,
  },

  // ==================== RECIPES ====================
  RECIPES: {
    ALL: `${API_BASE_URL}/recipes`,
    FEATURED: `${API_BASE_URL}/recipes/featured`,
    BY_ID: (recipeId) => `${API_BASE_URL}/recipes/${recipeId}`,
  },

  // ==================== ORDERS ====================
  ORDERS: {
    LIST: `${API_BASE_URL}/customer/order/list`,
    CREATE: `${API_BASE_URL}/orders`,
    BY_ID: (orderId) => `${API_BASE_URL}/orders/${orderId}`,
    UPDATE: (orderId) => `${API_BASE_URL}/orders/${orderId}`,
    CANCEL: (orderId) => `${API_BASE_URL}/orders/${orderId}/cancel`,
    PDF: (orderId) => `${BASE_URL}/orders/${orderId}/download`, // Public web route
    PDF_WEB: (orderId) => `${BASE_URL}/orders/${orderId}/pdf`, // Public web route (can return base64)
  },

  // ==================== PAYMENTS ====================
  PAYMENTS: {
    INITIATE: `${API_BASE_URL}/payments/initiate`,
    CONFIRM: `${API_BASE_URL}/payments/confirm`,
    STATUS: (paymentId) => `${API_BASE_URL}/payments/${paymentId}/status`,
  },

  // ==================== NOTIFICATIONS ====================
  NOTIFICATIONS: {
    ALL: `${API_BASE_URL}/notifications`,
    UNREAD: `${API_BASE_URL}/notifications/unread`,
    MARK_READ: (notificationId) => `${API_BASE_URL}/notifications/${notificationId}/read`,
    MARK_ALL_READ: `${API_BASE_URL}/notifications/mark-all-read`,
  },

  // ==================== UPLOADS ====================
  UPLOADS: {
    AVATAR: `${API_BASE_URL}/upload/avatar`,
    DOCUMENT: `${API_BASE_URL}/upload/document`,
  },

  // ==================== CADEAUX ====================
  CADEAUX: {
    ALL: `${API_BASE_URL}/cadeaux`,
    BY_ID: (id) => `${API_BASE_URL}/cadeaux/${id}`,
    BY_CLIENT: (clientId) => `${API_BASE_URL}/cadeaux/client/${clientId}`,
    ALL_BY_CLIENT: (clientId) => `${API_BASE_URL}/cadeaux/client/${clientId}/all`,
    BY_TYPE: (type) => `${API_BASE_URL}/cadeaux/type/${type}`,
    ACTIVE_COUNT: `${API_BASE_URL}/cadeaux/active-count`,
    CREATE: `${API_BASE_URL}/cadeaux`,
    UPDATE: (id) => `${API_BASE_URL}/cadeaux/${id}`,
    DELETE: (id) => `${API_BASE_URL}/cadeaux/${id}`,
    TOGGLE_STATUS: (id) => `${API_BASE_URL}/cadeaux/${id}/toggle-status`,
    ACQUIRE: (id) => `${API_BASE_URL}/cadeaux/${id}/acquire`,
    MY_ACQUISITIONS: `${API_BASE_URL}/cadeaux/my-acquisitions/list`,
    ACQUISITION_BY_CODE: (code) => `${API_BASE_URL}/cadeaux/acquisition/${code}`,
  },

  // ==================== PRODUITS GRATUITS ====================
  FREE_PRODUCTS: {
    ALL: `${API_BASE_URL}/free-products`,
    BY_ID: (id) => `${API_BASE_URL}/free-products/${id}`,
    RESERVE: (id) => `${API_BASE_URL}/free-products/${id}/reserve`,
    MY_RESERVATIONS: `${API_BASE_URL}/free-products/my-reservations/list`,
    RESERVATION_BY_ID: (id) => `${API_BASE_URL}/free-products/reservations/${id}`,
  },

  // ==================== CODES PROMO PARTENAIRES ====================
  // ==================== CODES PROMO PARTENAIRES ====================
  CODE_PROMO: {
    ALL: `${API_BASE_URL}/promo-codes`,  // ✅ CORRECTION: promo-codes au lieu de code-promos
    BY_ID: (id) => `${API_BASE_URL}/promo-codes/${id}`, // ✅ CORRECTION
    RESERVE: (id) => `${API_BASE_URL}/promo-codes/${id}/reserve`, // ✅ CORRECTION
    MY_CODES: `${API_BASE_URL}/promo-codes/my`, // ✅ CORRECTION: /my au lieu de /my-codes
  },

  // ==================== WISHLIST ====================
  WISHLIST: {
    ALL: `${API_BASE_URL}/customer/wishlist`,
    ADD: `${API_BASE_URL}/customer/wishlist/add`,
    REMOVE: `${API_BASE_URL}/customer/wishlist/remove`,
    CHECK: (productId) => `${API_BASE_URL}/customer/wishlist/check/${productId}`,
    BATCH_CHECK: `${API_BASE_URL}/customer/wishlist/check`,
    CLEAR: `${API_BASE_URL}/customer/wishlist/clear`,
    SYNC: `${API_BASE_URL}/customer/wishlist/sync`,
    COUNT: `${API_BASE_URL}/customer/wishlist/count`,
    TOGGLE: `${API_BASE_URL}/customer/wishlist/toggle`,
  },

  // ==================== DELIVERY ====================
  DELIVERY: {
    CALCULATE_FEE: `${API_BASE_URL}/delivery/calculate-fee`,
    AVAILABLE_MODES: `${API_BASE_URL}/delivery/available-modes`,
  },

  // ==================== STORES ====================
  STORES: {
    ALL: `${API_BASE_URL}/stores`,
    NEARBY: `${API_BASE_URL}/stores/nearby`,
    DETAILS: (id) => `${API_BASE_URL}/stores/${id}`,
  },

  // ==================== LOYALTY CARD (✅ NOUVEAU) ====================
  LOYALTY: {
    GET: `${API_BASE_URL}/customer/loyalty-card`,
    GENERATE: `${API_BASE_URL}/customer/loyalty-card/generate`,
    REPORT_LOST: `${API_BASE_URL}/customer/loyalty-card/report-lost`,
    HISTORY: `${API_BASE_URL}/customer/loyalty-card/history`,
    BALANCE: `${API_BASE_URL}/customer/loyalty-card/balance`,
    VALIDATE: `${API_BASE_URL}/customer/loyalty-card/validate`,
  },

  // ==================== CLAIMS / RÉCLAMATIONS ====================
  CLAIMS: {
    ALL: `${API_BASE_URL}/claims`,
    TYPES: `${API_BASE_URL}/claims/types`,
    BY_ID: (id) => `${API_BASE_URL}/claims/${id}`,
    CREATE: `${API_BASE_URL}/claims`,
    UPDATE: (id) => `${API_BASE_URL}/claims/${id}`,
    DELETE: (id) => `${API_BASE_URL}/claims/${id}`,
    MESSAGES: (id) => `${API_BASE_URL}/claims/${id}/messages`,
    FEEDBACK: (id) => `${API_BASE_URL}/claims/${id}/feedback`,
  },

  // ==================== CREDIT ====================
  CREDIT: {
    RULES: `${API_BASE_URL}/credit/rules`,
    SIMULATE: `${API_BASE_URL}/credit/simulate`,
    ELIGIBILITY: `${API_BASE_URL}/credit/eligibility`,
    CREATE_DOSSIER: `${API_BASE_URL}/credit/dossier`,
    LIST_DOSSIERS: `${API_BASE_URL}/credit/dossiers`,
    UPLOAD_DOCUMENT: `${API_BASE_URL}/credit/upload`,
  },
};

// ==================== HELPER FUNCTIONS ====================

export const getFullAuthToken = () => {
  try {
    const localToken = localStorage.getItem('token');
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    const token = localToken || cookieToken || null;
    if (!token) {

    }
    return token;
  } catch (e) {

    return null;
  }
};

export const getAuthHeaders = (token = null) => {
  const authToken = token || getFullAuthToken();

  if (!authToken) {

  }

  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
};

export const getAuthHeadersBinary = (token = null) => {
  const authToken = token || localStorage.getItem('token');

  return {
    'Authorization': `Bearer ${authToken}`,
  };
};

export const getAuthHeadersMultipart = (token = null) => {
  const authToken = token || localStorage.getItem('token');

  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'multipart/form-data',
  };
};

export const handleApiError = (error) => {


  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
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

export const validateToken = async (token) => {
  try {
    const response = await fetch(API_ENDPOINTS.USER.PROFILE, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};

export default {
  BASE_URL,
  API_BASE_URL,
  API_TIMEOUT,
  GOOGLE_MAPS_API_KEY,
  ENDPOINTS: API_ENDPOINTS,
  getAuthHeaders,
  getAuthHeadersBinary,
  getAuthHeadersMultipart,
  handleApiError,
  validateToken,
};
