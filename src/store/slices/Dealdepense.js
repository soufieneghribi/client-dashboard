import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "https://tn360-back-office-122923924979.europe-west1.run.app/api/v1";

// Async thunk to fetch deal depense data
export const fetchDealDepense = createAsyncThunk(
  "depense/fetchDealDepense",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dealDepense`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch deal depense"
      );
    }
  }
);

// Async thunk to update deal depense
export const updateDealDepense = createAsyncThunk(
  "depense/updateDealDepense",
  async ({ ID_deal_depense, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/dealDepense/${ID_deal_depense}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update deal depense"
      );
    }
  }
);

// Async thunk to mark deal as completed and update cagnotte
export const completeDealDepense = createAsyncThunk(
  "depense/completeDealDepense",
  async ({ ID_deal_depense, gain }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/dealDepense/${ID_deal_depense}/complete`,
        { gain }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to complete deal depense"
      );
    }
  }
);

const dealDepenseSlice = createSlice({
  name: "depense",
  initialState: {
    depense: [],
    loading: false,
    error: null,
    selectedDeal: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    selectDeal: (state, action) => {
      state.selectedDeal = action.payload;
    },
    clearSelectedDeal: (state) => {
      state.selectedDeal = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch deal depense
      .addCase(fetchDealDepense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDealDepense.fulfilled, (state, action) => {
        state.loading = false;
        state.depense = action.payload;
      })
      .addCase(fetchDealDepense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update deal depense
      .addCase(updateDealDepense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDealDepense.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.depense.findIndex(
          (deal) => deal.ID_deal_depense === action.payload.ID_deal_depense
        );
        if (index !== -1) {
          state.depense[index] = action.payload;
        }
      })
      .addCase(updateDealDepense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Complete deal depense
      .addCase(completeDealDepense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeDealDepense.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.depense.findIndex(
          (deal) => deal.ID_deal_depense === action.payload.ID_deal_depense
        );
        if (index !== -1) {
          state.depense[index] = action.payload;
        }
      })
      .addCase(completeDealDepense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, selectDeal, clearSelectedDeal } = dealDepenseSlice.actions;
export default dealDepenseSlice.reducer;