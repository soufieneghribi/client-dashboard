import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

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


            // Handle different response formats
            if (response.data.data) {
                return response.data.data;
            } else if (Array.isArray(response.data)) {
                return response.data;
            }
            return [];
        } catch (error) {

            // 
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


            if (response.data.data) {
                return response.data.data;
            } else if (Array.isArray(response.data)) {
                return response.data;
            }
            return [];
        } catch (error) {

            return rejectWithValue(error.response?.data?.message || "Erreur de chargement");
        }
    }
);

// ===================================
// SLICE CONFIGURATION
// ===================================

const MOCK_STORES = [
    // MG Stores
    { id: 1, name: "MG Maxi Centre Ville", concept: "MG Maxi", address: "Centre Ville", city: "Tunis", gouvernorat: "Tunis", latitude: 36.7992, longitude: 10.1797, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Maxi+Centre+Ville+Tunis+Tunisie" },
    { id: 2, name: "MG City Lafayette", concept: "MG City", address: "Lafayette", city: "Tunis", gouvernorat: "Tunis", latitude: 36.8123, longitude: 10.1834, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+City+Lafayette+Tunis+Tunisie" },
    { id: 3, name: "MG Proxi El Menzah", concept: "MG Proxi", address: "El Menzah", city: "Tunis", gouvernorat: "Tunis", latitude: 36.8412, longitude: 10.1710, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Proxi+El+Menzah+Tunis+Tunisie" },
    { id: 4, name: "MG Maxi Ariana", concept: "MG Maxi", address: "Ariana Centre", city: "Ariana", gouvernorat: "Ariana", latitude: 36.8665, longitude: 10.1930, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Maxi+Ariana+Ariana+Tunisie" },
    { id: 5, name: "MG Proxi Borj Louzir", concept: "MG Proxi", address: "Borj Louzir", city: "Borj Louzir", gouvernorat: "Ariana", latitude: 36.8900, longitude: 10.1900, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Proxi+Borj+Louzir+Borj+Louzir+Tunisie" },
    { id: 6, name: "MG Maxi Ezzahra", concept: "MG Maxi", address: "Ezzahra Centre", city: "Ezzahra", gouvernorat: "Ben Arous", latitude: 36.7450, longitude: 10.3050, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Maxi+Ezzahra+Ezzahra+Tunisie" },
    { id: 7, name: "MG Bizerte Centre", concept: "MG Maxi", address: "Bizerte Centre", city: "Bizerte", gouvernorat: "Bizerte", latitude: 37.2740, longitude: 9.8730, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Bizerte+Centre+Bizerte+Tunisie" },
    { id: 8, name: "MG Hammamet", concept: "MG Maxi", address: "Hammamet Centre", city: "Hammamet", gouvernorat: "Nabeul", latitude: 36.4000, longitude: 10.6160, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Hammamet+Hammamet+Tunisie" },
    { id: 9, name: "MG Nabeul Centre", concept: "MG City", address: "Nabeul Centre", city: "Nabeul", gouvernorat: "Nabeul", latitude: 36.4560, longitude: 10.7370, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Nabeul+Centre+Nabeul+Tunisie" },
    { id: 10, name: "MG Sousse Centre", concept: "MG Maxi", address: "Sousse Centre", city: "Sousse", gouvernorat: "Sousse", latitude: 35.8250, longitude: 10.6400, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Sousse+Centre+Sousse+Tunisie" },
    { id: 11, name: "MG Monastir Centre", concept: "MG Maxi", address: "Monastir Centre", city: "Monastir", gouvernorat: "Monastir", latitude: 35.7780, longitude: 10.8260, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Monastir+Centre+Monastir+Tunisie" },
    { id: 12, name: "MG Mahdia", concept: "MG City", address: "Mahdia Centre", city: "Mahdia", gouvernorat: "Mahdia", latitude: 35.5040, longitude: 11.0620, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Mahdia+Mahdia+Tunisie" },
    { id: 13, name: "MG Maxi Sfax", concept: "MG Maxi", address: "Sfax Centre", city: "Sfax", gouvernorat: "Sfax", latitude: 34.7400, longitude: 10.7600, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Maxi+Sfax+Sfax+Tunisie" },
    { id: 14, name: "MG Beja", concept: "MG City", address: "Beja Centre", city: "Beja", gouvernorat: "Beja", latitude: 36.7250, longitude: 9.1810, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Beja+Beja+Tunisie" },
    { id: 15, name: "MG Gabes", concept: "MG Maxi", address: "Gabes Centre", city: "Gabes", gouvernorat: "Gabes", latitude: 33.8810, longitude: 10.0980, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Gabes+Gabes+Tunisie" },
    { id: 16, name: "MG Mednine", concept: "MG City", address: "Mednine Centre", city: "Mednine", gouvernorat: "Mednine", latitude: 33.3540, longitude: 10.4900, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Mednine+Mednine+Tunisie" },
    { id: 17, name: "MG Tozeur", concept: "MG City", address: "Tozeur Centre", city: "Tozeur", gouvernorat: "Tozeur", latitude: 33.9180, longitude: 8.1330, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Tozeur+Tozeur+Tunisie" },
    { id: 18, name: "MG Kebili", concept: "MG City", address: "Kebili Centre", city: "Kebili", gouvernorat: "Kebili", latitude: 33.7050, longitude: 8.9710, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Kebili+Kebili+Tunisie" },
    { id: 19, name: "MG Zaghouan", concept: "MG City", address: "Zaghouan Centre", city: "Zaghouan", gouvernorat: "Zaghouan", latitude: 36.4020, longitude: 10.1420, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Zaghouan+Zaghouan+Tunisie" },
    { id: 20, name: "MG Kef", concept: "MG City", address: "Le Kef Centre", city: "Le Kef", gouvernorat: "Le Kef", latitude: 36.1710, longitude: 8.7040, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Kef+Le+Kef+Tunisie" },
    { id: 21, name: "MG Siliana", concept: "MG City", address: "Siliana Centre", city: "Siliana", gouvernorat: "Siliana", latitude: 36.0840, longitude: 9.3700, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Siliana+Siliana+Tunisie" },
    { id: 22, name: "MG Kairouan", concept: "MG Maxi", address: "Kairouan Centre", city: "Kairouan", gouvernorat: "Kairouan", latitude: 35.6780, longitude: 10.0960, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Kairouan+Kairouan+Tunisie" },
    { id: 23, name: "MG Gafsa", concept: "MG Maxi", address: "Gafsa Centre", city: "Gafsa", gouvernorat: "Gafsa", latitude: 34.4250, longitude: 8.7840, is_active: 1, enseigne: "MG", horaires_ouverture: "08:00", horaires_fermeture: "20:00", maps: "https://www.google.com/maps/search/MG+Gafsa+Gafsa+Tunisie" },

    // BATAM Stores
    { id: 101, name: "Batam Avenue de Paris", concept: "Batam", address: "Avenue de Paris", city: "Tunis", gouvernorat: "Tunis", latitude: 36.8020, longitude: 10.1790, is_active: 1, enseigne: "Batam" },
    { id: 102, name: "Batam Jean Jaurès", concept: "Batam", address: "Jean Jaurès", city: "Tunis", gouvernorat: "Tunis", latitude: 36.8040, longitude: 10.1840, is_active: 1, enseigne: "Batam" },
    { id: 103, name: "Batam Ariana", concept: "Batam", address: "Ariana Centre", city: "Ariana", gouvernorat: "Ariana", latitude: 36.8620, longitude: 10.1960, is_active: 1, enseigne: "Batam" },
    { id: 104, name: "Batam Megrine", concept: "Batam", address: "Megrine Centre", city: "Megrine", gouvernorat: "Ben Arous", latitude: 36.7720, longitude: 10.2310, is_active: 1, enseigne: "Batam" },
    { id: 105, name: "Batam Sousse Trocadéro", concept: "Batam", address: "Sousse Trocadéro", city: "Sousse", gouvernorat: "Sousse", latitude: 35.8330, longitude: 10.6350, is_active: 1, enseigne: "Batam" },
    { id: 106, name: "Batam Monastir", concept: "Batam", address: "Monastir Centre", city: "Monastir", gouvernorat: "Monastir", latitude: 35.7720, longitude: 10.8240, is_active: 1, enseigne: "Batam" },
    { id: 107, name: "Batam Sfax", concept: "Batam", address: "Sfax Centre", city: "Sfax", gouvernorat: "Sfax", latitude: 34.7330, longitude: 10.7600, is_active: 1, enseigne: "Batam" },
    { id: 108, name: "Batam Gabes", concept: "Batam", address: "Gabes Centre", city: "Gabes", gouvernorat: "Gabes", latitude: 33.8820, longitude: 10.0980, is_active: 1, enseigne: "Batam" },
    { id: 109, name: "Batam Gafsa", concept: "Batam", address: "Gafsa Centre", city: "Gafsa", gouvernorat: "Gafsa", latitude: 34.4250, longitude: 8.7840, is_active: 1, enseigne: "Batam" },
    { id: 110, name: "Batam Hammamet", concept: "Batam", address: "Hammamet Centre", city: "Hammamet", gouvernorat: "Nabeul", latitude: 36.4020, longitude: 10.6120, is_active: 1, enseigne: "Batam" },
    { id: 111, name: "Batam Djerba", concept: "Batam", address: "Djerba Centre", city: "Djerba", gouvernorat: "Mednine", latitude: 33.8750, longitude: 10.8570, is_active: 1, enseigne: "Batam" },
    { id: 112, name: "Batam Beja", concept: "Batam", address: "Beja Centre", city: "Beja", gouvernorat: "Beja", latitude: 36.7260, longitude: 9.1840, is_active: 1, enseigne: "Batam" },
    { id: 113, name: "Batam Zaghouan", concept: "Batam", address: "Zaghouan Centre", city: "Zaghouan", gouvernorat: "Zaghouan", latitude: 36.4020, longitude: 10.1430, is_active: 1, enseigne: "Batam" },
    { id: 114, name: "Batam Kairouan", concept: "Batam", address: "Kairouan Centre", city: "Kairouan", gouvernorat: "Kairouan", latitude: 35.6780, longitude: 10.0960, is_active: 1, enseigne: "Batam" },
    { id: 115, name: "Batam Jendouba", concept: "Batam", address: "Jendouba Centre", city: "Jendouba", gouvernorat: "Jendouba", latitude: 36.5010, longitude: 8.7770, is_active: 1, enseigne: "Batam" },
    { id: 116, name: "Batam Sidi Bouzid", concept: "Batam", address: "Sidi Bouzid Centre", city: "Sidi Bouzid", gouvernorat: "Sidi Bouzid", latitude: 35.0350, longitude: 9.4850, is_active: 1, enseigne: "Batam" },
    { id: 117, name: "Batam Kef", concept: "Batam", address: "Le Kef Centre", city: "Le Kef", gouvernorat: "Le Kef", latitude: 36.1740, longitude: 8.7050, is_active: 1, enseigne: "Batam" },
    { id: 118, name: "Batam Tozeur", concept: "Batam", address: "Tozeur Centre", city: "Tozeur", gouvernorat: "Tozeur", latitude: 33.9210, longitude: 8.1340, is_active: 1, enseigne: "Batam" },
    { id: 119, name: "Batam Ain Zaghouan", concept: "Batam", address: "Ain Zaghouan", city: "Tunis", gouvernorat: "Tunis", latitude: 36.8480, longitude: 10.2680, is_active: 1, enseigne: "Batam" }
];

const storesSlice = createSlice({
    name: "stores",
    initialState: {
        stores: MOCK_STORES,
        nearbyStores: [],
        selectedStore: null,
        loading: false,
        error: null,
    },
    reducers: {
        selectStore: (state, action) => {
            state.selectedStore = action.payload;

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
                // Use API data if available, otherwise keep/fallback to mock data
                if (action.payload && action.payload.length > 0) {
                    state.stores = action.payload.filter(store => store.is_active);
                } else if (state.stores.length === 0) {
                    state.stores = MOCK_STORES;
                }
            })
            .addCase(fetchStores.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                // Keep mock stores on error for development
                if (state.stores.length === 0) {
                    state.stores = MOCK_STORES;
                }
            })

            // Fetch Nearby Stores
            .addCase(fetchNearbyStores.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNearbyStores.fulfilled, (state, action) => {
                state.loading = false;
                state.nearbyStores = action.payload;

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


