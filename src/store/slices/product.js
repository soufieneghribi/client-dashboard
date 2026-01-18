import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "../../services/api";

export const fetchProduct = createAsyncThunk(
  "product/fetchProduct",
  async ({ id_type, params = {} }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        channel: 'web',
        ...params
      });

      // Handle nested attributes properly
      if (params.attributes) {
        Object.keys(params.attributes).forEach(attrId => {
          const values = params.attributes[attrId];
          if (Array.isArray(values)) {
            values.forEach(val => {
              queryParams.append(`attributes[${attrId}][]`, val);
            });
          } else {
            queryParams.append(`attributes[${attrId}]`, values);
          }
        });
      }

      // Remove the plain attributes object from queryParams if it was spread
      queryParams.delete('attributes');

      const response = await axios.get(`${API_ENDPOINTS.PRODUCTS.BY_TYPE(id_type)}?${queryParams.toString()}`, {
        headers: getAuthHeaders()
      });
      // For list endpoints, we might need the full wrapper for pagination metadata (total, last_page)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAttributes = createAsyncThunk(
  "product/fetchAttributes",
  async (id_type, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_ENDPOINTS.CATEGORIES.ATTRIBUTES(id_type), {
        headers: getAuthHeaders()
      });
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "product/fetchProductById",
  async (idProduct, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_ENDPOINTS.PRODUCTS.BY_ID(idProduct), {
        headers: getAuthHeaders()
      });
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAllProduct = createAsyncThunk(
  "product/fetchAllProduct",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        channel: 'web',
        ...params
      });
      const response = await axios.get(`${API_ENDPOINTS.PRODUCTS.ALL}?${queryParams.toString()}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    product: [],
    availableAttributes: [],
    loading: null,
    loadingAttributes: false,
    error: null,
    errorAttributes: null,
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
        const payload = action.payload;
        state.error = (payload && typeof payload === 'object') ? (payload.message || payload.error || JSON.stringify(payload)) : payload;
      })
      .addCase(fetchAttributes.pending, (state) => {
        state.loadingAttributes = true;
        state.errorAttributes = null;
      })
      .addCase(fetchAttributes.fulfilled, (state, action) => {
        state.loadingAttributes = false;
        // Handle wrapped response { success, message, data } or direct array
        state.availableAttributes = action.payload.data || action.payload || [];
      })
      .addCase(fetchAttributes.rejected, (state, action) => {
        state.loadingAttributes = false;
        const payload = action.payload;
        state.errorAttributes = (payload && typeof payload === 'object') ? (payload.message || payload.error || JSON.stringify(payload)) : payload;
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
        const payload = action.payload;
        state.error = (payload && typeof payload === 'object') ? (payload.message || payload.error || JSON.stringify(payload)) : payload;
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
        const payload = action.payload;
        state.error = (payload && typeof payload === 'object') ? (payload.message || payload.error || JSON.stringify(payload)) : payload;
      });
  },
});

export default productSlice.reducer;
