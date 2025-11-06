import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS, getAuthHeaders } from "../../services/api";

/**
 * Order Redux Slice
 * Manages order state and API calls for fetching order history
 */

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
        API_ENDPOINTS.ORDERS.LIST,
        {
          headers: getAuthHeaders(auth_token)
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