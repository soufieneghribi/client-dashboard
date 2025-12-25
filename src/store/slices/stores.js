import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../../services/api";

// ===================================
// ASYNC THUNKS
// ===================================

/**
 * Fetch all active stores
 */
export const fetchStores = createAsyncThunk(
    "stores/fetchStores",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(API_ENDPOINTS.STORES.ALL);
            console.log("✅ Stores fetched:", response.data);

            // Handle different response formats
            if (response.data.data) {
                return response.data.data;
            } else if (Array.isArray(response.data)) {
                return response.data;
            }
            return [];
        } catch (error) {
            console.error("❌ Fetch stores error:", error);
            toast.error("Échec du chargement des magasins");
            return rejectWithValue(error.response?.data?.message || "Erreur de chargement");
        }
    }
);

/**
 * Fetch nearby stores
 */
export const fetchNearbyStores = createAsyncThunk(
    "stores/fetchNearbyStores",
    async ({ latitude, longitude, radius = 10 }, { rejectWithValue }) => {
        try {
            const response = await axios.get(API_ENDPOINTS.STORES.NEARBY, {
                params: { latitude, longitude, radius }
            });
            console.log("✅ Nearby stores fetched:", response.data);

            if (response.data.data) {
                return response.data.data;
            } else if (Array.isArray(response.data)) {
                return response.data;
            }
            return [];
        } catch (error) {
            console.error("❌ Fetch nearby stores error:", error);
            return rejectWithValue(error.response?.data?.message || "Erreur de chargement");
        }
    }
);

// ===================================
// SLICE CONFIGURATION
// ===================================

const storesSlice = createSlice({
    name: "stores",
    initialState: {
        stores: [],
        nearbyStores: [],
        selectedStore: null,
        loading: false,
        error: null,
    },
    reducers: {
        selectStore: (state, action) => {
            state.selectedStore = action.payload;
            console.log("🏪 Selected store:", action.payload);
        },
        clearSelectedStore: (state) => {
            state.selectedStore = null;
        },
        clearStoresError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Stores
            .addCase(fetchStores.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStores.fulfilled, (state, action) => {
                state.loading = false;
                state.stores = action.payload.filter(store => store.is_active);
                console.log("✅ Active stores loaded:", state.stores.length);
            })
            .addCase(fetchStores.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Nearby Stores
            .addCase(fetchNearbyStores.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNearbyStores.fulfilled, (state, action) => {
                state.loading = false;
                state.nearbyStores = action.payload;
                console.log("✅ Nearby stores loaded:", state.nearbyStores.length);
            })
            .addCase(fetchNearbyStores.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

// ===================================
// EXPORTS
// ===================================

export const { selectStore, clearSelectedStore, clearStoresError } = storesSlice.actions;

// Selectors
export const selectAllStores = (state) => state.stores.stores;
export const selectNearbyStores = (state) => state.stores.nearbyStores;
export const selectSelectedStore = (state) => state.stores.selectedStore;
export const selectStoresLoading = (state) => state.stores.loading;
export const selectStoresError = (state) => state.stores.error;

export default storesSlice.reducer;
