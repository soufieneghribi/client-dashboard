import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS, getAuthHeaders, handleApiError } from "../../services/api";

// ==================== CONSTANTS ====================
const RATE_LIMIT_DELAY = 2000;

// ==================== HELPER FUNCTIONS ====================
let lastRequestTime = 0;

const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const waitTime = RATE_LIMIT_DELAY - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
};

const getAuthToken = () => {
  try {
    return localStorage.getItem("token") || null;
  } catch (error) {
    return null;
  }
};

// ==================== ASYNC THUNKS - PROMOTIONS ====================

/**
 * Fetch promotions for a specific client
 */
export const fetchPromotionsByClient = createAsyncThunk(
  "promotions/fetchByClient",
  async (clientId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      await waitForRateLimit();

      const response = await fetch(
        API_ENDPOINTS.PROMOTIONS.BY_CLIENT(clientId),
        {
          method: "GET",
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.data || data.promotions || data || [];
    } catch (error) {
      const errorMessage = handleApiError(error);
      
      if (error.message !== "Rate limit exceeded") {
        toast.error(errorMessage);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Fetch all promotions
 */
export const fetchAllPromotions = createAsyncThunk(
  "promotions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      await waitForRateLimit();

      const response = await fetch(
        API_ENDPOINTS.PROMOTIONS.ALL || `${API_ENDPOINTS.BASE_URL}/promotions`,
        {
          method: "GET",
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.data || data.promotions || data || [];
    } catch (error) {
      const errorMessage = handleApiError(error);
      
      if (error.message !== "Rate limit exceeded") {
        toast.error(errorMessage);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// ==================== ASYNC THUNKS - GIFTS ====================

/**
 * Fetch available gifts that can be exchanged with cagnotte
 */
export const fetchGifts = createAsyncThunk(
  "promotions/fetchGifts",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      await waitForRateLimit();

      const response = await fetch(
        `${API_ENDPOINTS.BASE_URL}/customer/gifts`,
        {
          method: "GET",
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.data || data.gifts || data || [];
    } catch (error) {
      const errorMessage = handleApiError(error);
      
      if (error.message !== "Rate limit exceeded") {
        console.error("Error fetching gifts:", errorMessage);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Exchange cagnotte for a gift
 */
export const exchangeGift = createAsyncThunk(
  "promotions/exchangeGift",
  async ({ giftId, clientId }, { rejectWithValue, dispatch }) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      await waitForRateLimit();

      const response = await fetch(
        `${API_ENDPOINTS.BASE_URL}/customer/exchange-gift`,
        {
          method: "POST",
          headers: getAuthHeaders(token),
          body: JSON.stringify({
            gift_id: giftId,
            client_id: clientId
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'échange du cadeau");
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success("🎁 Cadeau échangé avec succès !");
        
        // Rafraîchir la liste des cadeaux après l'échange
        dispatch(fetchGifts());
        
        return data.data || data;
      } else {
        throw new Error(data.message || "Erreur lors de l'échange du cadeau");
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Fetch gift exchange history for a client
 */
export const fetchGiftHistory = createAsyncThunk(
  "promotions/fetchGiftHistory",
  async (clientId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      await waitForRateLimit();

      const response = await fetch(
        `${API_ENDPOINTS.BASE_URL}/customer/gift-history${clientId ? `?client_id=${clientId}` : ''}`,
        {
          method: "GET",
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.data || data.history || data || [];
    } catch (error) {
      const errorMessage = handleApiError(error);
      
      if (error.message !== "Rate limit exceeded") {
        console.error("Error fetching gift history:", errorMessage);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// ==================== SLICE ====================

const initialState = {
  // Promotions
  promotions: [],
  currentPromotion: null,
  loading: false,
  error: null,
  lastFetch: null,
  
  // Gifts
  gifts: [],
  giftsLoading: false,
  giftsError: null,
  selectedGift: null,
  
  // Gift History
  giftHistory: [],
  giftHistoryLoading: false,
  giftHistoryError: null,
  
  // Exchange
  exchangeLoading: false,
  exchangeError: null,
  lastExchangeResult: null,
};

const promotionsSlice = createSlice({
  name: "promotions",
  initialState,
  reducers: {
    // Promotions reducers
    clearPromotions: (state) => {
      state.promotions = [];
      state.error = null;
    },
    setCurrentPromotion: (state, action) => {
      state.currentPromotion = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Gifts reducers
    clearGifts: (state) => {
      state.gifts = [];
      state.giftsError = null;
    },
    setSelectedGift: (state, action) => {
      state.selectedGift = action.payload;
    },
    clearGiftsError: (state) => {
      state.giftsError = null;
    },
    
    // Exchange reducers
    clearExchangeError: (state) => {
      state.exchangeError = null;
    },
    clearLastExchangeResult: (state) => {
      state.lastExchangeResult = null;
    },
    
    // Clear all
    clearAllPromotionsData: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    // ==================== PROMOTIONS ====================
    
    // Fetch promotions by client
    builder
      .addCase(fetchPromotionsByClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotionsByClient.fulfilled, (state, action) => {
        state.loading = false;
        state.promotions = action.payload;
        state.lastFetch = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchPromotionsByClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Erreur lors du chargement des promotions";
      });

    // Fetch all promotions
    builder
      .addCase(fetchAllPromotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPromotions.fulfilled, (state, action) => {
        state.loading = false;
        state.promotions = action.payload;
        state.lastFetch = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchAllPromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Erreur lors du chargement des promotions";
      });

    // ==================== GIFTS ====================
    
    // Fetch gifts
    builder
      .addCase(fetchGifts.pending, (state) => {
        state.giftsLoading = true;
        state.giftsError = null;
      })
      .addCase(fetchGifts.fulfilled, (state, action) => {
        state.giftsLoading = false;
        state.gifts = action.payload;
        state.giftsError = null;
      })
      .addCase(fetchGifts.rejected, (state, action) => {
        state.giftsLoading = false;
        state.giftsError = action.payload || "Erreur lors du chargement des cadeaux";
      });

    // Exchange gift
    builder
      .addCase(exchangeGift.pending, (state) => {
        state.exchangeLoading = true;
        state.exchangeError = null;
      })
      .addCase(exchangeGift.fulfilled, (state, action) => {
        state.exchangeLoading = false;
        state.lastExchangeResult = action.payload;
        state.exchangeError = null;
        state.selectedGift = null;
      })
      .addCase(exchangeGift.rejected, (state, action) => {
        state.exchangeLoading = false;
        state.exchangeError = action.payload || "Erreur lors de l'échange du cadeau";
      });

    // Fetch gift history
    builder
      .addCase(fetchGiftHistory.pending, (state) => {
        state.giftHistoryLoading = true;
        state.giftHistoryError = null;
      })
      .addCase(fetchGiftHistory.fulfilled, (state, action) => {
        state.giftHistoryLoading = false;
        state.giftHistory = action.payload;
        state.giftHistoryError = null;
      })
      .addCase(fetchGiftHistory.rejected, (state, action) => {
        state.giftHistoryLoading = false;
        state.giftHistoryError = action.payload || "Erreur lors du chargement de l'historique";
      });
  },
});

// ==================== EXPORTS ====================

// Actions
export const { 
  clearPromotions, 
  setCurrentPromotion, 
  clearError,
  clearGifts,
  setSelectedGift,
  clearGiftsError,
  clearExchangeError,
  clearLastExchangeResult,
  clearAllPromotionsData
} = promotionsSlice.actions;

// Reducer
export default promotionsSlice.reducer;

// ==================== SELECTORS ====================

// Promotions selectors
export const selectPromotions = (state) => state.promotions.promotions;
export const selectPromotionsLoading = (state) => state.promotions.loading;
export const selectPromotionsError = (state) => state.promotions.error;
export const selectCurrentPromotion = (state) => state.promotions.currentPromotion;
export const selectLastFetch = (state) => state.promotions.lastFetch;

// Gifts selectors
export const selectGifts = (state) => state.promotions.gifts;
export const selectGiftsLoading = (state) => state.promotions.giftsLoading;
export const selectGiftsError = (state) => state.promotions.giftsError;
export const selectSelectedGift = (state) => state.promotions.selectedGift;

// Gift history selectors
export const selectGiftHistory = (state) => state.promotions.giftHistory;
export const selectGiftHistoryLoading = (state) => state.promotions.giftHistoryLoading;
export const selectGiftHistoryError = (state) => state.promotions.giftHistoryError;

// Exchange selectors
export const selectExchangeLoading = (state) => state.promotions.exchangeLoading;
export const selectExchangeError = (state) => state.promotions.exchangeError;
export const selectLastExchangeResult = (state) => state.promotions.lastExchangeResult;