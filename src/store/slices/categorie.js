import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Détection automatique de l'environnement
const API_BASE_URL = import.meta.env.DEV 
  ? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000')
  : (import.meta.env.VITE_API_BASE_URL_PROD || 'https://tn360-back-office-122923924979.europe-west1.run.app');



  const BASE_URL =  "https://tn360-back-office-122923924979.europe-west1.run.app";


const API_URL = `${BASE_URL}/api/v1`;


export const fetchCategories = createAsyncThunk(
  "categorie/fetchCategories", 
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/categories/article-types`);
      return response.data; 
    } catch (error) {
      console.error("Error fetching categories:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const categorieSlice = createSlice({
  name: "categorie",
  initialState: {
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default categorieSlice.reducer;