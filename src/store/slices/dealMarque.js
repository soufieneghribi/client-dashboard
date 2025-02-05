import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";

// Async thunk for fetching Depense deal
export const fetchDealMarque = createAsyncThunk(
  "marque/fetchDealMarque",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "https://tn360-122923924979.europe-west1.run.app/api/v1/dealMarque"
      );
      return response.data; // Return data to be handled in the fulfilled case
    } catch (err) {
      toast.error("Erreur lors du chargement des deals.");
      return rejectWithValue(err.response ? err.response.data : err.message); // Return error to be handled in the rejected case
    }
  }
);





const dealMarqueSlice = createSlice({
  name: "marque",
  initialState: {
    marque: [],  // Initializing as an empty array
  loading: false,
  error: null,
  },
  extraReducers: (builder) => {
  

    // Handling the FetchDealMarque actions
    builder.addCase(fetchDealMarque.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDealMarque.fulfilled, (state, action) => {
      state.loading = false;
      state.marque = action.payload;
    });
    builder.addCase(fetchDealMarque.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    
  },
});

export default dealMarqueSlice.reducer;
