import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Détection automatique de l'environnement
const API_BASE_URL = import.meta.env.DEV 
  ? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000')
  : (import.meta.env.VITE_API_BASE_URL_PROD || 'https://tn360-back-office-122923924979.europe-west1.run.app');


  const BASE_URL =  "https://tn360-back-office-122923924979.europe-west1.run.app";


const API_URL = `${BASE_URL}/api/v1`;





export const fetchProduct = createAsyncThunk(
  "product/fetchProduct", 
  async (id_type, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/type/${id_type}`);
      return response.data; 
    } catch (error) {
      console.error("Error fetching products:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "product/fetchProductById", 
  async (idProduct, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/product/${idProduct}`);
      return response.data; 
    } catch (error) {
      console.error("Error fetching products:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAllProduct = createAsyncThunk(
  "product/fetchAllProduct", 
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/allproducts`);
      return response.data; 
    } catch (error) {
      console.error("Error fetching products:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: { 
    product: [],
    loading: null,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchAllProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;