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
      toast.error("Échec de la recherche des produits");
      return rejectWithValue(error.response?.data?.message || "Échec de la recherche");
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState: {
    searchResults: [],   // ✅ Maintenant cohérent avec le nom utilisé
    loading: false,
    error: null,
    lastQuery: ""
  },
  reducers: {
    clearSearch: (state) => {
      state.searchResults = [];
      state.lastQuery = "";
      state.error = null;
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
        state.searchResults = action.payload || []; // ✅ Assure un tableau même si null
        state.lastQuery = action.meta.arg;
      })
      .addCase(SearchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Une erreur s'est produite lors de la recherche";
        state.searchResults = [];
      });
  }
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer;