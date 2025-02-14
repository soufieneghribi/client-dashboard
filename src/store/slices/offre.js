import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";

// Async thunk for fetching Offre
export const fetchOffre = createAsyncThunk(
  "offre/fetchOffre",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "https://tn360-122923924979.europe-west1.run.app/api/v1/offre"
      );
      return response.data;
    } catch (err) {
      toast.error("Erreur lors du chargement des offres.");
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  }
);
export const fetchOffreById = createAsyncThunk(
  "offre/etchOffreById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "https://tn360-122923924979.europe-west1.run.app/api/v1/offre/",id
      );
      return response.data;
    } catch (err) {
      toast.error("Erreur lors du chargement des offres.");
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  }
);

const offreSlice = createSlice({
  name: "offre",
  initialState: {
    offre: [], // Initializing as an empty array
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
      state.offre = action.payload; // Fix: Update `state.offre` instead of `state.deal`
    });
    builder.addCase(fetchOffre.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder.addCase(fetchOffreById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOffreById.fulfilled, (state, action) => {
      state.loading = false;
      state.offre = action.payload; // Fix: Update `state.offre` instead of `state.deal`
    });
    builder.addCase(fetchOffreById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default offreSlice.reducer;
