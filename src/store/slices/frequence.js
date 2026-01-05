import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { API_ENDPOINTS } from "../../services/api";

// Async thunk for fetching Frequence deal
export const fetchDealFrequence = createAsyncThunk(
  "frequence/fetchDealFrequence",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_ENDPOINTS.DEALS.FREQUENCE.ALL);
      return response.data;
    } catch (err) {
      // 
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  }
);

const frequenceSlice = createSlice({
  name: "frequence",
  initialState: {
    frequence: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDealFrequence.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDealFrequence.fulfilled, (state, action) => {
      state.loading = false;
      state.frequence = action.payload;
    });
    builder.addCase(fetchDealFrequence.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default frequenceSlice.reducer;


