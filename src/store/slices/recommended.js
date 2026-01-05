// store/slices/recommended.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Détection automatique de l'environnement
const API_BASE_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000')
  : (import.meta.env.VITE_API_BASE_URL_PROD || 'https://tn360-back-office-122923924979.europe-west1.run.app');

const BASE_URL = "https://tn360-back-office-122923924979.europe-west1.run.app";


const API_URL = `${BASE_URL}/api/v1`;

export const fetchRecommendedProduct = createAsyncThunk(
  "recommended/fetchRecommendedProduct",
  async (_, { rejectWithValue }) => {
    try {

      const response = await axios.get(`${API_URL}/products/recommended`);


      // S'assurer que la réponse est un tableau
      const recommendedData = response.data || [];

      if (!Array.isArray(recommendedData)) {

        return [];
      }

      return recommendedData;

    } catch (error) {


      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const recommendedSlice = createSlice({
  name: "recommended",
  initialState: {
    recommended: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Reducers synchrones optionnels
    clearRecommended: (state) => {
      state.recommended = [];
      state.error = null;
    },
    setRecommended: (state, action) => {
      state.recommended = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendedProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendedProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // S'assurer que les données sont un tableau
        state.recommended = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchRecommendedProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.recommended = []; // Réinitialiser en cas d'erreur
      });
  }
});

// Export des actions
export const { clearRecommended, setRecommended } = recommendedSlice.actions;

// Export du reducer
export default recommendedSlice.reducer;
