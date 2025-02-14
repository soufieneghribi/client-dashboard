import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";

// Async thunk for fetching Offre
export const fetchOrder = createAsyncThunk(
  "order/fetchOrder",
  async (auth_token, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "https://tn360-122923924979.europe-west1.run.app/api/v1/customer/order/list",
        {
          headers: {
            Authorization: `Bearer ${auth_token}`, // Include the token in the header
          },
        }
      );
      return response.data;
    } catch (err) {
      toast.error("Erreur lors du chargement des orders.");
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    order: [], // Initializing as an empty array
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    // Handling the fetchOffre actions
    builder.addCase(fetchOrder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrder.fulfilled, (state, action) => {
      state.loading = false;
      state.order = action.payload; // Fix: Update `state.offre` instead of `state.deal`
    });
    builder.addCase(fetchOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default orderSlice.reducer;
