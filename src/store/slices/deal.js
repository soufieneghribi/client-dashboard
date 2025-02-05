import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";

// Async thunk for fetching Depense deal
export const fetchDealDepense = createAsyncThunk(
  "deal/fetchDealDepense",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "https://tn360-122923924979.europe-west1.run.app/api/v1/dealDepense"
      );
      return response.data; // Return data to be handled in the fulfilled case
    } catch (err) {
      toast.error("Erreur lors du chargement des deals.");
      return rejectWithValue(err.response ? err.response.data : err.message); // Return error to be handled in the rejected case
    }
  }
);





const dealSlice = createSlice({
  name: "deal",
  initialState: {
    deal: [],  // Initializing as an empty array
  loading: false,
  error: null,
  },
  extraReducers: (builder) => {
  

    // Handling the FetchDealDepense actions
    builder.addCase(fetchDealDepense.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDealDepense.fulfilled, (state, action) => {
      state.loading = false;
      state.deal = action.payload;
    });
    builder.addCase(fetchDealDepense.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    
  },
});

export default dealSlice.reducer;
