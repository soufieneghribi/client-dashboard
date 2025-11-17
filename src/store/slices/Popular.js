// src/store/slices/Popular.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { API_ENDPOINTS, getAuthHeaders } from "../../services/api";

// ===================================
// CONFIGURATION
// ===================================

const API_TIMEOUT = 15000;

// ===================================
// HELPERS
// ===================================

const getAuthToken = () => {
  return localStorage.getItem("token") || null;
};

// ===================================
// ASYNC THUNKS
// ===================================

/**
 * Fetch popular products with promotions
 * Cette fonction charge soit les produits en promotion du client, soit 6 produits aléatoires
 */
export const fetchPopularWithPromotions = createAsyncThunk(
  "popular/fetchPopularWithPromotions",
  async (clientId = null, { rejectWithValue }) => {
    try {
      let articles = [];
      let hasPromotions = false;
      let promotionsData = null;

      // Si clientId est fourni, essayer de récupérer les promotions
      if (clientId) {
        try {
          const token = getAuthToken();
          const promoResponse = await axios.get(
            API_ENDPOINTS.PROMOTIONS.BY_CLIENT(clientId),
            {
              timeout: API_TIMEOUT,
              headers: getAuthHeaders(token)
            }
          );

          if (promoResponse.data && promoResponse.data.success && promoResponse.data.data) {
            // Extraire tous les articles des promotions
            articles = promoResponse.data.data.reduce((acc, promo) => {
              if (promo.articles && Array.isArray(promo.articles)) {
                return [...acc, ...promo.articles.map(article => ({
                  ...article,
                  promo_name: promo.name,
                  promo_id: promo.id,
                  promo_discount: promo.discount_value,
                  promo_start: promo.start_date,
                  promo_end: promo.end_date,
                  isPromotion: true
                }))];
              }
              return acc;
            }, []);

            hasPromotions = articles.length > 0;
            promotionsData = promoResponse.data;
            
          }
        } catch (promoError) {
          // Continuer avec les produits aléatoires en cas d'erreur
        }
      }

      // Si pas de promotions, charger 6 produits aléatoires depuis allproducts
      if (!hasPromotions) {
        
        const allProductsResponse = await axios.get(API_ENDPOINTS.PRODUCTS.ALL, {
          timeout: API_TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (allProductsResponse.data && allProductsResponse.data.products) {
          const allProducts = allProductsResponse.data.products;
          
          // Mélanger et prendre 6 produits aléatoires
          const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
          articles = shuffled.slice(0, 6).map(product => ({
            ...product,
            isPromotion: false
          }));
          
        }
      }

      return {
        products: articles,
        hasPromotions,
        promotionsData,
        clientId
      };

    } catch (error) {

      // Gestion des erreurs spécifiques
      if (error.code === 'ECONNABORTED') {
        toast.error("Délai d'attente dépassé. Veuillez réessayer.");
        return rejectWithValue("Timeout");
      } else if (error.response) {
        const message = error.response.data?.message || "Erreur serveur";
        toast.error(message);
        return rejectWithValue(message);
      } else if (error.request) {
        toast.error("Problème de connexion réseau");
        return rejectWithValue("Network error");
      } else {
        toast.error("Une erreur est survenue");
        return rejectWithValue(error.message);
      }
    }
  }
);

/**
 * Fetch popular products (ancienne méthode conservée pour compatibilité)
 */
export const fetchPopular = createAsyncThunk(
  "popular/fetchPopular",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_ENDPOINTS.PRODUCTS.POPULAR, {
        timeout: API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.products) {
        return response.data;
      }

      return { products: [] };

    } catch (error) {

      if (error.code === 'ECONNABORTED') {
        toast.error("Délai d'attente dépassé. Veuillez réessayer.");
        return rejectWithValue("Timeout");
      } else if (error.response) {
        const message = error.response.data?.message || "Erreur serveur";
        toast.error(message);
        return rejectWithValue(message);
      } else if (error.request) {
        toast.error("Problème de connexion réseau");
        return rejectWithValue("Network error");
      } else {
        toast.error("Une erreur est survenue");
        return rejectWithValue(error.message);
      }
    }
  }
);

/**
 * Refresh popular products
 */
export const refreshPopular = createAsyncThunk(
  "popular/refreshPopular",
  async (clientId = null, { dispatch }) => {
    if (clientId) {
      return dispatch(fetchPopularWithPromotions(clientId));
    }
    return dispatch(fetchPopular());
  }
);

// ===================================
// SLICE (équivalent PopularProductController Flutter)
// ===================================

const popularSlice = createSlice({
  name: "popular",
  initialState: {
    // Données
    popular: [],              
    products: [],             
    
    // Promotions
    hasPromotions: false,     // Indique si les produits affichés sont des promotions
    promotionsData: null,     // Données complètes des promotions
    clientId: null,           // ID du client actuel
    
    // États de chargement
    loading: false,           
    isLoaded: false,          
    
    // Erreurs
    error: null,              
    
    // Métadonnées
    lastFetch: null,          
    totalCount: 0,            
  },

  reducers: {
    /**
     * Clear popular products
     */
    clearPopular: (state) => {
      state.popular = [];
      state.products = [];
      state.hasPromotions = false;
      state.promotionsData = null;
      state.clientId = null;
      state.error = null;
      state.isLoaded = false;
      state.lastFetch = null;
      state.totalCount = 0;
    },

    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Set loading manually
     */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },

  extraReducers: (builder) => {
    // ===================================
    // FETCH POPULAR WITH PROMOTIONS
    // ===================================
    builder
      .addCase(fetchPopularWithPromotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularWithPromotions.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoaded = true;
        state.products = action.payload.products || [];
        state.hasPromotions = action.payload.hasPromotions || false;
        state.promotionsData = action.payload.promotionsData;
        state.clientId = action.payload.clientId;
        state.totalCount = state.products.length;
        state.lastFetch = new Date().toISOString();
        state.error = null;
        
        console.log("✅ Produits chargés:", {
        });
      })
      .addCase(fetchPopularWithPromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Échec du chargement";
        state.isLoaded = false;
        
      })

    // ===================================
    // FETCH POPULAR (ancienne méthode)
    // ===================================
      .addCase(fetchPopular.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopular.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoaded = true;
        state.popular = action.payload;
        state.products = action.payload.products || [];
        state.hasPromotions = false;
        state.totalCount = state.products.length;
        state.lastFetch = new Date().toISOString();
        state.error = null;
        
        console.log("✅ Produits populaires chargés:", {
        });
      })
      .addCase(fetchPopular.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Échec du chargement";
        state.isLoaded = false;
        
      })

    // ===================================
    // REFRESH POPULAR
    // ===================================
      .addCase(refreshPopular.pending, (state) => {
        state.loading = true;
        console.log("🔄 Rafraîchissement des produits...");
      });
  },
});

// ===================================
// EXPORTS
// ===================================

// Actions
export const { 
  clearPopular, 
  clearError, 
  setLoading 
} = popularSlice.actions;

// Selectors
export const selectPopularProducts = (state) => state.popular.products;
export const selectPopularLoading = (state) => state.popular.loading;
export const selectPopularError = (state) => state.popular.error;
export const selectPopularIsLoaded = (state) => state.popular.isLoaded;
export const selectPopularCount = (state) => state.popular.totalCount;
export const selectPopularLastFetch = (state) => state.popular.lastFetch;
export const selectHasPromotions = (state) => state.popular.hasPromotions;
export const selectPromotionsData = (state) => state.popular.promotionsData;

// Selector avec transformation
export const selectPopularProductsWithDiscount = (state) => {
  return state.popular.products.map(product => ({
    ...product,
    discountedPrice: (product.price * 0.9).toFixed(2),
    hasDiscount: true,
    discountPercentage: 10
  }));
};

// Selector filtré par prix
export const selectPopularProductsByPriceRange = (min, max) => (state) => {
  return state.popular.products.filter(
    product => product.price >= min && product.price <= max
  );
};

// Reducer
export default popularSlice.reducer;

// ===================================
// HELPER FUNCTIONS
// ===================================

/**
 * Check if data needs refresh
 */
export const shouldRefreshPopular = (state) => {
  if (!state.popular.isLoaded) return true;
  if (!state.popular.lastFetch) return true;
  
  const lastFetch = new Date(state.popular.lastFetch);
  const now = new Date();
  const diffMinutes = (now - lastFetch) / 1000 / 60;
  
  // Recharger si plus de 30 minutes
  return diffMinutes > 30;
};