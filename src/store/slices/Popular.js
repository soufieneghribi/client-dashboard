// src/store/slices/Popular.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

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
// Dans Popular.js - Modifier fetchPopularWithPromotions
export const fetchPopularWithPromotions = createAsyncThunk(
  "popular/fetchPopularWithPromotions",
  async ({ clientId = null, universeId = null }, { rejectWithValue, getState }) => {
    try {
      let state = getState();
      let categories = state.categorie?.categories || [];

      // Si les catégories ne sont pas chargées, on essaie de les récupérer
      if (categories.length === 0) {
        try {
          const catResponse = await axios.get(API_ENDPOINTS.CATEGORIES.ALL, { timeout: 5000 });
          if (catResponse.data) {
            categories = catResponse.data;
          }
        } catch (e) {
          console.error("Erreur thunk Popular:", e);
        }
      }

      // Helper to identify if a product belongs to the universe
      const belongsToUniverse = (product, uniId) => {
        const catId = product.category_id || product.id_type || product.ID_type;
        const cat = categories.find(c => c.id === parseInt(catId));
        const pName = (product.name || product.title || "").toLowerCase();
        const catTitle = (cat?.title || cat?.name || "").toLowerCase();

        // Mots-clés Électronique (Marques + Types)
        const electronicsKeywords = [
          'informatique', 'téléphonie', 'télévision', 'tv', 'gaming', 'électroménager', 'électronique',
          'high-tech', 'pc', 'ordinateur', 'smartphone', 'climatiseur', 'climatisation', 'split',
          'réfrigérateur', 'frigo', 'congélateur', 'lave-linge', 'machine à laver', 'lave-vaisselle',
          'samsung', 'lg', 'asus', 'hp', 'dell', 'lenovo', 'apple', 'huawei', 'xiaomi', 'oppo',
          'infinix', 'sony', 'whirlpool', 'beko', 'haier', 'tcl', 'condor', 'coala', 'moulinex'
        ];

        // Mots-clés Épicerie / Produits à EXCLURE de l'électronique
        const groceryKeywords = [
          'judy', 'lilas', 'javel', 'lessive', 'vaisselle', 'savon', 'shampoing', 'couche',
          'huile', 'sucre', 'tomate', 'pâte', 'couscous', 'thon', 'yaourt', 'lait', 'fromage',
          'boisson', 'jus', 'eau', 'biscuit', 'chocolat', 'café', 'thé', 'sauce', 'algérienne',
          'mayonnaise', 'ketchup', 'harissa', 'épice', 'sel', 'poivre', 'riz', 'farine', 'semoule',
          'pates', 'conserves', 'jadida', 'nejma', 'sicam', 'le moulin', 'delice', 'danone'
        ];

        if (uniId === 2) { // Électronique
          if (product.universe_id === 2 || cat?.universe_id === 2 || product.universe_id === "2") return true;
          const electronicsCategoryIds = [144, 2, 3, 4, 5, 23, 24, 25, 26];
          if (electronicsCategoryIds.includes(parseInt(catId)) ||
            electronicsCategoryIds.includes(parseInt(product.parent_category_id)) ||
            electronicsCategoryIds.includes(parseInt(cat?.parent_id))) {
            if (groceryKeywords.some(kw => pName.includes(kw))) return false;
            return true;
          }
          const hasElecKeyword = electronicsKeywords.some(kw => pName.includes(kw) || catTitle.includes(kw));
          const hasGroceryKeyword = groceryKeywords.some(kw => pName.includes(kw));
          return hasElecKeyword && !hasGroceryKeyword;
        }

        // Mode Épicerie par défaut (null)
        if (electronicsKeywords.some(kw => pName.includes(kw)) && !groceryKeywords.some(kw => pName.includes(kw))) {
          return false; // On évite de polluer l'épicerie avec du high-tech pur
        }
        return true;
      };

      let articles = [];
      let hasPromotions = false;
      let promotionsData = null;

      // 1. Logique spéciale pour ÉLECTRONIQUE (2) : TOUJOURS 12 articles aléatoires
      if (universeId === 2) {
        const allProductsResponse = await axios.get(API_ENDPOINTS.PRODUCTS.ALL, {
          timeout: 20000,
          headers: { 'Content-Type': 'application/json' }
        });

        const data = allProductsResponse.data;
        let pList = [];
        if (Array.isArray(data)) pList = data;
        else if (data?.products && Array.isArray(data.products)) pList = data.products;
        else if (data?.data && Array.isArray(data.data)) pList = data.data;
        else if (data?.data?.data && Array.isArray(data.data.data)) pList = data.data.data;

        if (pList && pList.length > 0) {
          // Filtrage STRICT
          const electronicsProducts = pList.filter(p => belongsToUniverse(p, 2));

          let finalSelection = electronicsProducts;
          if (finalSelection.length < 5) {
            finalSelection = pList.filter(p => {
              const name = (p.name || "").toLowerCase();
              return !groceryKeywords.some(kw => name.includes(kw));
            });
          }

          const shuffled = [...finalSelection].sort(() => 0.5 - Math.random());
          articles = shuffled.slice(0, 12).map(product => ({
            ...product,
            id: product.id || product.ID,
            isPromotion: false
          }));

          hasPromotions = false;
        }
      }
      // 2. Pour ÉPICERIE (null) : Promotions en priorité
      else {
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
              const validPromotions = promoResponse.data.data.filter(promo => {
                const isActive = new Date(promo.start_date) <= new Date() &&
                  new Date(promo.end_date) >= new Date();
                const hasValidArticles = promo.articles && Array.isArray(promo.articles) && promo.articles.length > 0;
                return isActive && hasValidArticles;
              });

              articles = validPromotions.reduce((acc, promo) => {
                return [...acc, ...promo.articles.map(article => ({
                  ...article,
                  id: article.id || article.ID || article.product_id,
                  promo_name: promo.name,
                  promo_id: promo.id,
                  promo_discount: promo.discount_value,
                  promo_start: promo.start_date,
                  promo_end: promo.end_date,
                  promo_client_id: clientId,
                  isPromotion: true
                }))];
              }, []);

              // Filtrer par univers
              articles = articles.filter(article => belongsToUniverse(article, null));

              hasPromotions = articles.length > 0;
              promotionsData = promoResponse.data;
            }
          } catch (promoError) { }
        }

        // Fallback si pas de promotions
        if (!hasPromotions) {
          const allProductsResponse = await axios.get(API_ENDPOINTS.PRODUCTS.ALL, {
            timeout: 20000,
            headers: { 'Content-Type': 'application/json' }
          });

          const data = allProductsResponse.data;
          let pList = [];
          if (Array.isArray(data)) pList = data;
          else if (data?.products && Array.isArray(data.products)) pList = data.products;
          else if (data?.data && Array.isArray(data.data)) pList = data.data;

          if (pList && pList.length > 0) {
            const filteredProducts = pList.filter(p => belongsToUniverse(p, null));

            const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random());
            articles = shuffled.slice(0, 6).map(product => ({
              ...product,
              id: product.id || product.ID,
              isPromotion: false
            }));
          }
        }
      }

      return {
        products: articles,
        hasPromotions,
        promotionsData,
        clientId,
        universeId
      };

    } catch (error) {
      // Gestion des erreurs existante...


      // Gestion des erreurs spécifiques
      if (error.code === 'ECONNABORTED') {
        // 
        return rejectWithValue("Timeout");
      } else if (error.response) {
        const message = error.response.data?.message || "Erreur serveur";
        // 
        return rejectWithValue(message);
      } else if (error.request) {
        // 
        return rejectWithValue("Network error");
      } else {
        // 
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
        // 
        return rejectWithValue("Timeout");
      } else if (error.response) {
        const message = error.response.data?.message || "Erreur serveur";
        // 
        return rejectWithValue(message);
      } else if (error.request) {
        // 
        return rejectWithValue("Network error");
      } else {
        // 
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


