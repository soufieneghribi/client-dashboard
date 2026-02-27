import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { API_ENDPOINTS } from "../../services/api";

// ===================================
// CONFIGURATION
// ===================================

const API_TIMEOUT = 15000;

// ===================================
// ASYNC THUNKS
// ===================================

/**
 * Search products by query
 */
export const SearchProduct = createAsyncThunk(
  "search/SearchProduct",
  async (query, { rejectWithValue }) => {
    try {
      // Validation de la requête
      if (!query || query.trim().length === 0) {
        return [];
      }

      const response = await axios.get(
        `${API_ENDPOINTS.PRODUCTS.SEARCH}?query=${encodeURIComponent(query)}`,
        {
          timeout: API_TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      // ✅ CORRECTION: Gérer la structure de réponse du backend
      // Le backend retourne { status, total_size, products }
      if (response.data && response.data.products) {
        return response.data.products;
      }

      // Si la réponse est directement un tableau
      if (Array.isArray(response.data)) {
        return response.data;
      }

      return [];

    } catch (error) {


      // Gestion des erreurs spécifiques
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        // 
      } else if (error.response?.status === 404) {
        // Pas de résultats trouvés - ne pas afficher d'erreur
        return [];
      } else if (error.response?.status === 429) {
        // 
      } else if (error.response?.status === 500) {
        // 
      } else if (!error.response) {
        // Erreur réseau
        // 
      }

      return rejectWithValue(
        error.response?.data?.message || "Échec de la recherche"
      );
    }
  }
);

/**
 * Search products with filters
 */
export const SearchProductWithFilters = createAsyncThunk(
  "search/SearchProductWithFilters",
  async ({ query, filters = {} }, { rejectWithValue }) => {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      // Construire les paramètres de recherche
      const params = new URLSearchParams({
        query: query,
        ...filters
      });

      const response = await axios.get(
        `${API_ENDPOINTS.PRODUCTS.SEARCH}?${params.toString()}`,
        {
          timeout: API_TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      // ✅ CORRECTION: Gérer la structure de réponse du backend
      if (response.data && response.data.products) {
        return response.data.products;
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }

      return [];

    } catch (error) {


      if (error.response?.status !== 404) {
        // 
      }

      return rejectWithValue(
        error.response?.data?.message || "Échec de la recherche"
      );
    }
  }
);

// ===================================
// SLICE CONFIGURATION
// ===================================

const searchSlice = createSlice({
  name: "search",
  initialState: {
    searchResults: [],
    loading: false,
    error: null,
    lastQuery: "",
    filters: {},
    hasSearched: false, // ✅ NOUVEAU: Suivre si une recherche a été effectuée
  },
  reducers: {
    /**
     * Clear search results
     */
    clearSearch: (state) => {
      state.searchResults = [];
      state.lastQuery = "";
      state.error = null;
      state.filters = {};
      state.hasSearched = false;
    },

    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Set search filters
     */
    setFilters: (state, action) => {
      state.filters = action.payload;
    },

    /**
     * Update last query
     */
    setLastQuery: (state, action) => {
      state.lastQuery = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // ===================================
      // SEARCH PRODUCT
      // ===================================
      .addCase(SearchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.hasSearched = true;
      })
      .addCase(SearchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = Array.isArray(action.payload) ? action.payload : [];
        state.lastQuery = action.meta.arg;
        state.error = null;
      })
      .addCase(SearchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Une erreur s'est produite lors de la recherche";
        state.searchResults = [];
      })

      // ===================================
      // SEARCH PRODUCT WITH FILTERS
      // ===================================
      .addCase(SearchProductWithFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.hasSearched = true;
      })
      .addCase(SearchProductWithFilters.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = Array.isArray(action.payload) ? action.payload : [];
        state.lastQuery = action.meta.arg.query;
        state.filters = action.meta.arg.filters;
        state.error = null;
      })
      .addCase(SearchProductWithFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Une erreur s'est produite lors de la recherche";
        state.searchResults = [];
      });
  }
});

// ===================================
// EXPORTS
// ===================================

export const {
  clearSearch,
  clearError,
  setFilters,
  setLastQuery
} = searchSlice.actions;

// Selectors
export const selectSearchResults = (state) => state.search.searchResults;
export const selectSearchLoading = (state) => state.search.loading;
export const selectSearchError = (state) => state.search.error;
export const selectLastQuery = (state) => state.search.lastQuery;
export const selectFilters = (state) => state.search.filters;
export const selectHasSearched = (state) => state.search.hasSearched;

export default searchSlice.reducer;


