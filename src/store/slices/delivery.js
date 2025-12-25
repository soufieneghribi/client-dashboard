import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";
import { API_ENDPOINTS, getAuthHeaders } from "../../services/api";

// ===================================
// ASYNC THUNKS
// ===================================

/**
 * Fetch available delivery modes
 */
export const fetchAvailableModes = createAsyncThunk(
    "delivery/fetchAvailableModes",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                API_ENDPOINTS.DELIVERY.AVAILABLE_MODES,
                { headers: getAuthHeaders() }
            );
            console.log("✅ Available delivery modes:", response.data);
            return response.data.data || response.data || [];
        } catch (error) {
            console.error("❌ Fetch delivery modes error:", error);
            return rejectWithValue(
                error.response?.data?.message || "Échec du chargement des modes de livraison"
            );
        }
    }
);

/**
 * Calculate delivery fee
 * @param {Object} params - Calculation parameters
 * @param {Object} params.delivery_address - Address object {rue, ville, gouvernorat, code_postal}
 * @param {Number} params.cart_total - Total cart amount
 * @param {String} params.mode_livraison_id - Delivery mode ID
 * @param {Array} params.cart_items - Cart items for weight calculation
 * @param {Number} params.store_id - Optional store ID
 */
export const calculateDeliveryFee = createAsyncThunk(
    "delivery/calculateDeliveryFee",
    async (params, { rejectWithValue }) => {
        try {
            console.log("📦 Calculating delivery fee with params:", params);

            const response = await axios.post(
                API_ENDPOINTS.DELIVERY.CALCULATE_FEE,
                params,
                { headers: getAuthHeaders() }
            );

            console.log("✅ Delivery fee calculated:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Calculate delivery fee error:", error);
            console.error("❌ Error response:", error.response?.data);

            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                "Échec du calcul des frais de livraison";

            toast.error(errorMessage);
            return rejectWithValue(error.response?.data);
        }
    }
);

// ===================================
// SLICE CONFIGURATION
// ===================================

const deliverySlice = createSlice({
    name: "delivery",
    initialState: {
        modes: [],
        selectedMode: null,
        calculatedFee: null,
        feeDetails: null,
        loading: false,
        calculating: false,
        error: null,
    },
    reducers: {
        setSelectedMode: (state, action) => {
            state.selectedMode = action.payload;
            console.log("🚚 Selected delivery mode:", action.payload);
        },
        clearCalculatedFee: (state) => {
            state.calculatedFee = null;
            state.feeDetails = null;
        },
        clearDeliveryError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Available Modes
            .addCase(fetchAvailableModes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAvailableModes.fulfilled, (state, action) => {
                state.loading = false;
                state.modes = action.payload;
                // Auto-select first mode if available
                if (action.payload.length > 0 && !state.selectedMode) {
                    state.selectedMode = action.payload[0].mode_livraison_id;
                }
                console.log("✅ Delivery modes loaded:", action.payload.length);
            })
            .addCase(fetchAvailableModes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Calculate Delivery Fee
            .addCase(calculateDeliveryFee.pending, (state) => {
                state.calculating = true;
                state.error = null;
            })
            .addCase(calculateDeliveryFee.fulfilled, (state, action) => {
                state.calculating = false;
                state.calculatedFee = action.payload.delivery_fee ?? action.payload.frais_livraison ?? 0;
                state.feeDetails = action.payload;
                console.log("✅ Delivery fee calculated:", state.calculatedFee);
            })
            .addCase(calculateDeliveryFee.rejected, (state, action) => {
                state.calculating = false;
                state.error = action.payload;
                state.calculatedFee = null;
                state.feeDetails = null;
            });
    },
});

// ===================================
// EXPORTS
// ===================================

export const { setSelectedMode, clearCalculatedFee, clearDeliveryError } = deliverySlice.actions;

// Selectors
export const selectDeliveryModes = (state) => state.delivery.modes;
export const selectSelectedMode = (state) => state.delivery.selectedMode;
export const selectCalculatedFee = (state) => state.delivery.calculatedFee;
export const selectFeeDetails = (state) => state.delivery.feeDetails;
export const selectDeliveryLoading = (state) => state.delivery.loading;
export const selectDeliveryCalculating = (state) => state.delivery.calculating;
export const selectDeliveryError = (state) => state.delivery.error;

export default deliverySlice.reducer;
