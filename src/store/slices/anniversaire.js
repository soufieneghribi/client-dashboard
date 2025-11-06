import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS } from "../../services/api";

// Async thunk for fetching Anniversaire deal
export const fetchAnniversaire = createAsyncThunk(
  "anniversaire/fetchAnniversaire",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_ENDPOINTS.DEALS.ANNIVERSAIRE.ALL);
      return response.data;
    } catch (err) {
      toast.error("Erreur lors du chargement des deals.");
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  }
);


const anniversaireSlice = createSlice({
  name: "anniversaire",
  initialState: {
    anniversaire: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAnniversaire.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAnniversaire.fulfilled, (state, action) => {
      state.loading = false;
      state.anniversaire = action.payload;
    });
    builder.addCase(fetchAnniversaire.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default anniversaireSlice.reducer;