import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { API_ENDPOINTS } from "../../services/api";

// ==================== ASYNC THUNKS ====================

// Charger la liste des codes promo
export const fetchCodePromos = createAsyncThunk(
  "codePromo/fetchCodePromos",
  async ({ page = 1, filters = {} } = {}, { rejectWithValue }) => {
    try {
      const params = {
        page: page.toString(),
        per_page: "20",
      };

      // Ajouter les filtres supportés
      if (filters.search) params.search = filters.search;
      if (filters.partnerId) params.partnerId = filters.partnerId;
      if (filters.offerType) params.offerType = filters.offerType;
      if (filters.codeType) params.codeType = filters.codeType;
      if (filters.sortBy) {
        params.sortBy = filters.sortBy;
        params.sortDirection = filters.sortDirection || "desc";
      }

      const response = await apiClient.get(API_ENDPOINTS.CODE_PROMO.ALL, { params });
      const result = response.data;

      // ✅ Gérer les différents formats de réponse
      let codesData = [];
      if (result.success && result.data) {
        codesData = result.data;
      } else if (Array.isArray(result)) {
        codesData = result;
      } else if (Array.isArray(result.data)) {
        codesData = result.data;
      }

      if (codesData.length > 0) {
        // ✅ Filtrer avec les bons noms de champs
        const now = new Date();
        const filteredData = codesData.filter(code => {
          // Vérifier is_active au lieu de is_published
          if (!code.is_active) return false;

          // Vérifier valid_to au lieu de valid_until
          const notExpired = !code.valid_to || new Date(code.valid_to) >= now;

          // Vérifier valid_from
          const notUpcoming = !code.valid_from || new Date(code.valid_from) <= now;

          // Vérifier stock_remaining au lieu de remaining_quantity
          const inStock = !code.is_limited || (code.stock_remaining && code.stock_remaining > 0);

          return notExpired && notUpcoming && inStock;
        });

        return {
          data: filteredData,
          pagination: result.pagination || result.meta || {
            current_page: page,
            last_page: page,
            per_page: 20,
            total: filteredData.length,
          },
          page,
        };
      } else {
        return {
          data: [],
          pagination: {
            current_page: page,
            last_page: page,
            per_page: 20,
            total: 0,
          },
          page,
        };
      }
    } catch (error) {
      console.error("Erreur fetchCodePromos:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Charger les détails d'un code promo
export const fetchCodePromoDetails = createAsyncThunk(
  "codePromo/fetchCodePromoDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CODE_PROMO.BY_ID(id));
      const result = response.data;

      // Gérer les différents formats
      if (result.success && result.data) {
        return result.data;
      } else if (result.id) {
        // Format direct
        return result;
      } else {
        return rejectWithValue("Format de réponse invalide");
      }
    } catch (error) {
      console.error("Erreur fetchCodePromoDetails:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Réserver un code promo
export const reserveCodePromo = createAsyncThunk(
  "codePromo/reserveCodePromo",
  async (codePromoId, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CODE_PROMO.RESERVE(codePromoId));
      const result = response.data;

      if (result.success) {
        return result.data;
      } else if (result.id) {
        return result;
      } else {
        return rejectWithValue(result.message || "Erreur de réservation");
      }
    } catch (error) {
      console.error("Erreur reserveCodePromo:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Charger mes codes réservés
export const fetchMyCodePromos = createAsyncThunk(
  "codePromo/fetchMyCodePromos",
  async ({ status = null } = {}, { rejectWithValue }) => {
    try {
      const params = {
        per_page: "50",
      };

      if (status) {
        params.status = status;
      }

      const response = await apiClient.get(API_ENDPOINTS.CODE_PROMO.MY_CODES, { params });
      const result = response.data;

      // Gérer les différents formats
      let myCodesData = [];
      if (result.success && result.data) {
        myCodesData = result.data;
      } else if (Array.isArray(result)) {
        myCodesData = result;
      } else if (Array.isArray(result.data)) {
        myCodesData = result.data;
      }

      return {
        data: myCodesData,
        status,
      };
    } catch (error) {
      console.error("Erreur fetchMyCodePromos:", error);
      return rejectWithValue(error.message);
    }
  }
);

// ==================== SLICE ====================

const codePromoSlice = createSlice({
  name: "codePromo",
  initialState: {
    // Liste des codes promo
    codePromos: [],
    isLoading: false,
    error: null,
    currentPage: 1,
    lastPage: 1,
    hasMore: false,

    // Filtres
    filters: {
      search: null,
      partnerId: null,
      offerType: null,
      codeType: null,
      sortBy: null,
      sortDirection: null,
    },

    // Détails
    selectedCodePromo: null,
    isLoadingDetails: false,
    detailsError: null,

    // Réservation
    isReserving: false,
    reservationError: null,
    lastReservation: null,

    // Mes codes
    myCodes: [],
    isLoadingMyCodes: false,
    myCodesError: null,
    myCodesStatusFilter: "reserved",
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = {
        search: null,
        partnerId: null,
        offerType: null,
        codeType: null,
        sortBy: null,
        sortDirection: null,
      };
      state.currentPage = 1;
    },
    setSearch: (state, action) => {
      state.filters.search = action.payload;
      state.currentPage = 1;
    },
    setMyCodesStatusFilter: (state, action) => {
      state.myCodesStatusFilter = action.payload;
    },
    clearReservation: (state) => {
      state.lastReservation = null;
      state.reservationError = null;
    },
    clearSelectedCodePromo: (state) => {
      state.selectedCodePromo = null;
      state.detailsError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch code promos
    builder
      .addCase(fetchCodePromos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCodePromos.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, pagination, page } = action.payload;

        if (page === 1) {
          state.codePromos = data;
        } else {
          state.codePromos = [...state.codePromos, ...data];
        }

        state.currentPage = pagination?.current_page || page;
        state.lastPage = pagination?.last_page || page;
        state.hasMore = state.currentPage < state.lastPage;
      })
      .addCase(fetchCodePromos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Erreur de chargement";
      });

    // Fetch code promo details
    builder
      .addCase(fetchCodePromoDetails.pending, (state) => {
        state.isLoadingDetails = true;
        state.detailsError = null;
      })
      .addCase(fetchCodePromoDetails.fulfilled, (state, action) => {
        state.isLoadingDetails = false;
        state.selectedCodePromo = action.payload;
      })
      .addCase(fetchCodePromoDetails.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.detailsError = action.payload || "Erreur de chargement";
      });

    // Reserve code promo
    builder
      .addCase(reserveCodePromo.pending, (state) => {
        state.isReserving = true;
        state.reservationError = null;
      })
      .addCase(reserveCodePromo.fulfilled, (state, action) => {
        state.isReserving = false;
        state.lastReservation = action.payload;
      })
      .addCase(reserveCodePromo.rejected, (state, action) => {
        state.isReserving = false;
        state.reservationError = action.payload || "Erreur de réservation";
      });

    // Fetch my code promos
    builder
      .addCase(fetchMyCodePromos.pending, (state) => {
        state.isLoadingMyCodes = true;
        state.myCodesError = null;
      })
      .addCase(fetchMyCodePromos.fulfilled, (state, action) => {
        state.isLoadingMyCodes = false;
        state.myCodes = action.payload.data;
        state.myCodesStatusFilter = action.payload.status || "reserved";
      })
      .addCase(fetchMyCodePromos.rejected, (state, action) => {
        state.isLoadingMyCodes = false;
        state.myCodesError = action.payload || "Erreur de chargement";
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSearch,
  setMyCodesStatusFilter,
  clearReservation,
  clearSelectedCodePromo,
} = codePromoSlice.actions;

export default codePromoSlice.reducer;
