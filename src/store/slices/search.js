import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

export const SearchProduct = createAsyncThunk(
  "search/SearchProduct",
  async (query, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://tn360-lqd25ixbvq-ew.a.run.app/api/v1/products/search?query=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search products");
      return rejectWithValue(error.response?.data?.message || "Search failed");
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState: {
    searchResults: [],
    loading: false,
    error: null,
    lastQuery: ""
  },
  reducers: {
    clearSearch: (state) => {
      state.searchResults = [];
      state.lastQuery = "";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(SearchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(SearchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.products || [];
        state.lastQuery = action.meta.arg;
      })
      .addCase(SearchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An error occurred during search";
        state.searchResults = [];
      });
  }
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer;