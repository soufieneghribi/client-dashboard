import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
// Async thunk for fetching Frequence deal
export const fetchDealFrequence = createAsyncThunk(
    "frequence/fetchDealFrequence",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(
          "https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/dealFrequence"
        );
        return response.data;
      } catch (err) {
        toast.error("Erreur lors du chargement des deals.");
        return rejectWithValue(err.response ? err.response.data : err.message);
      }
    }
  );
  const frequenceSlice = createSlice({
    name: "frequence",
    initialState: {
     frequence: [],  // Initializing as an empty array
    loading: false,
    error: null,
    },
    extraReducers: (builder) => {
      
      // Handling the FetchDealFrequence actions
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
  