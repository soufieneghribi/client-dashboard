import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { API_ENDPOINTS } from "../../services/api";

// Async thunk for fetching Offre
export const fetchOffre = createAsyncThunk(
  "offre/fetchOffre",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_ENDPOINTS.OFFERS.ALL);
      return response.data;
    } catch (err) {
      // 
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  }
);

export const fetchOffreById = createAsyncThunk(
  "offre/fetchOffreById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_ENDPOINTS.OFFERS.BY_ID(id));
      return response.data;
    } catch (err) {
      // 
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  }
);

const offreSlice = createSlice({
  name: "offre",
  initialState: {
    offre: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    // Handling the fetchOffre actions
    builder.addCase(fetchOffre.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOffre.fulfilled, (state, action) => {
      state.loading = false;
      state.offre = action.payload;
    });
    builder.addCase(fetchOffre.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    // Handling the fetchOffreById actions
    builder.addCase(fetchOffreById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOffreById.fulfilled, (state, action) => {
      state.loading = false;
      state.offre = action.payload;
    });
    builder.addCase(fetchOffreById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default offreSlice.reducer;


