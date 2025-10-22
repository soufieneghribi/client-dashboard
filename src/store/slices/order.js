import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";

/**
 * Order Redux Slice
 * Manages order state and API calls for fetching order history
 */

// API Configuration
const API_BASE_URL = "https://tn360-back-office-122923924979.europe-west1.run.app/api/v1";

/**
 * Async thunk for fetching order list
 * @param {string} auth_token - Authentication token
 * @returns {Promise} Order data from API
 */
export const fetchOrder = createAsyncThunk(
  "order/fetchOrder",
  async (auth_token, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/customer/order/list`,
        {
          headers: {
            Authorization: `Bearer ${auth_token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        }
      );
      return response.data;
    } catch (err) {
      toast.error("Erreur lors du chargement des commandes.");
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  }
);

/**
 * Order slice configuration
 */
const orderSlice = createSlice({
  name: "order",
  initialState: {
    order: [], // Array of orders
    loading: false,
    error: null,
  },
  reducers: {
    // Additional reducers can be added here
    clearOrders: (state) => {
      state.order = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Handle fetchOrder pending state
    builder.addCase(fetchOrder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    
    // Handle fetchOrder success
    builder.addCase(fetchOrder.fulfilled, (state, action) => {
      state.loading = false;
      state.order = action.payload;
    });
    
    // Handle fetchOrder error
    builder.addCase(fetchOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { clearOrders } = orderSlice.actions;
export default orderSlice.reducer;