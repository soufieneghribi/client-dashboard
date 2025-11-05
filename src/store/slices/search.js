import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

// ===================================
// CONFIGURATION DE L'URL DE BASE
// ===================================

/**
 * Détermine l'URL de base en fonction de l'environnement
 * Utilise les variables d'environnement VITE
 * Note: L'API de recherche peut utiliser une URL différente
 */
const getApiBaseUrl = () => {
  // Vérifier si on est en développement
  const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development' || 
                        import.meta.env.MODE === 'development';
  
  if (isDevelopment) {
    // URL de développement (localhost)
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  } else {
    // URL de production - Utiliser VITE_SEARCH_API_URL si disponible, sinon utiliser l'URL par défaut
    return import.meta.env.VITE_SEARCH_API_URL || 
           import.meta.env.VITE_API_BASE_URL_PROD || 
           'https://tn360-lqd25ixbvq-ew.a.run.app';
  }
};

// URL de base pour tous les appels API de recherche
const API_BASE_URL = `${getApiBaseUrl()}/api/v1`;

// Configuration du timeout
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 15000;

if (import.meta.env.VITE_DEBUG_MODE === 'true') {
}

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
        `${API_BASE_URL}/products/search?query=${encodeURIComponent(query)}`,
        {
          timeout: API_TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error("Search error:", error);
      
      // Gestion des erreurs spécifiques
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        toast.error("Délai d'attente dépassé. Veuillez réessayer.");
      } else if (error.response?.status === 404) {
        // Pas de résultats trouvés - ne pas afficher d'erreur
        return [];
      } else if (error.response?.status === 429) {
        toast.error("Trop de recherches. Veuillez patienter un moment.");
      } else if (error.response?.status === 500) {
        toast.error("Erreur serveur lors de la recherche.");
      } else {
        toast.error("Échec de la recherche des produits");
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
        `${API_BASE_URL}/products/search?${params.toString()}`,
        {
          timeout: API_TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error("Search with filters error:", error);
      toast.error("Échec de la recherche avec filtres");
      
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

export default searchSlice.reducer;