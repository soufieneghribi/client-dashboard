import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS, getAuthHeaders } from "../../services/api";

/**
 * Loyalty Card Redux Slice
 * Path: src/store/slices/loyaltyCardSlice.js
 */

// ==================== ASYNC THUNKS ====================

export const getLoyaltyCard = createAsyncThunk(
  "loyaltyCard/getLoyaltyCard",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("Veuillez vous connecter");

      console.log("🔍 Fetching loyalty card...");
      const { data } = await axios.get(
        API_ENDPOINTS.LOYALTY.GET,
        { headers: getAuthHeaders(token) }
      );
      console.log("✅ Loyalty card response:", data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching loyalty card:", error);
      const errorMessage = error.response?.data?.message || "Erreur lors du chargement de la carte";
      if (error.response?.status === 401 || error.response?.status === 403) {
        return rejectWithValue("Session expirée. Veuillez vous reconnecter.");
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const generateLoyaltyCard = createAsyncThunk(
  "loyaltyCard/generateLoyaltyCard",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Veuillez vous connecter");
        return rejectWithValue("Veuillez vous connecter");
      }

      console.log("🔄 Generating loyalty card...");
      const { data } = await axios.post(
        API_ENDPOINTS.LOYALTY.GENERATE,
        {},
        { headers: getAuthHeaders(token) }
      );

      toast.success("Carte fidélité générée avec succès!");
      console.log("✅ Loyalty card generated:", data);
      return data;
    } catch (error) {
      console.error("❌ Error generating loyalty card:", error);
      const errorMessage = error.response?.data?.message || "Erreur lors de la génération de la carte";
      toast.error(errorMessage);
      if (error.response?.status === 401 || error.response?.status === 403) {
        return rejectWithValue("Session expirée. Veuillez vous reconnecter.");
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const getLoyaltyCardHistory = createAsyncThunk(
  "loyaltyCard/getLoyaltyCardHistory",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("Veuillez vous connecter");

      console.log("🔍 Fetching loyalty card history...");
      const { data } = await axios.get(
        API_ENDPOINTS.LOYALTY.HISTORY,
        { headers: getAuthHeaders(token) }
      );
      console.log("✅ Loyalty history response:", data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching loyalty history:", error);
      const errorMessage = error.response?.data?.message || "Erreur lors du chargement de l'historique";
      if (error.response?.status === 401 || error.response?.status === 403) {
        return rejectWithValue("Session expirée");
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const reportLostCard = createAsyncThunk(
  "loyaltyCard/reportLostCard",
  async (reason, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Veuillez vous connecter");
        return rejectWithValue("Veuillez vous connecter");
      }

      console.log("🔄 Reporting lost card...");
      const { data } = await axios.post(
        API_ENDPOINTS.LOYALTY.REPORT_LOST,
        { reason: reason || "Carte perdue" },
        { headers: getAuthHeaders(token) }
      );

      toast.success("Nouvelle carte générée avec succès! Ancienne carte désactivée.");
      console.log("✅ Lost card reported and new card generated:", data);
      return data;
    } catch (error) {
      console.error("❌ Error reporting lost card:", error);
      const errorMessage = error.response?.data?.message || "Erreur lors de la déclaration de perte";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ==================== SLICE ====================

const loyaltyCardSlice = createSlice({
  name: "loyaltyCard",
  initialState: {
    loyaltyCard: null,
    history: null,
    loading: false,
    isGenerating: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLoyaltyCard: (state) => {
      state.loyaltyCard = null;
      state.history = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Loyalty Card
      .addCase(getLoyaltyCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLoyaltyCard.fulfilled, (state, action) => {
        state.loading = false;
        // CORRECTION: L'API retourne maintenant {success, has_card, loyalty_card}
        state.loyaltyCard = action.payload.loyalty_card;
        state.error = null;
        console.log("🔄 Redux state updated with loyalty card:", action.payload.loyalty_card);
      })
      .addCase(getLoyaltyCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Generate Loyalty Card
      .addCase(generateLoyaltyCard.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateLoyaltyCard.fulfilled, (state, action) => {
        state.isGenerating = false;
        // CORRECTION: L'API retourne maintenant {success, has_card, loyalty_card}
        state.loyaltyCard = action.payload.loyalty_card;
        state.error = null;
      })
      .addCase(generateLoyaltyCard.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload;
      })

      // Get History
      .addCase(getLoyaltyCardHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLoyaltyCardHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
        console.log("🔄 Redux state updated with history:", action.payload);
      })
      .addCase(getLoyaltyCardHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Report Lost Card
      .addCase(reportLostCard.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(reportLostCard.fulfilled, (state, action) => {
        state.isGenerating = false;
        // CORRECTION: L'API retourne maintenant {success, has_card, loyalty_card}
        state.loyaltyCard = action.payload.loyalty_card;
        state.error = null;
      })
      .addCase(reportLostCard.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearLoyaltyCard } = loyaltyCardSlice.actions;

export const selectLoyaltyCard = (state) => state.loyaltyCard.loyaltyCard;
export const selectLoyaltyHistory = (state) => state.loyaltyCard.history;
export const selectLoyaltyLoading = (state) => state.loyaltyCard.loading;
export const selectIsGenerating = (state) => state.loyaltyCard.isGenerating;
export const selectLoyaltyError = (state) => state.loyaltyCard.error;

export default loyaltyCardSlice.reducer;