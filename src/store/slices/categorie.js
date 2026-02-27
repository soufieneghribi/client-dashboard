import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "../../services/api";

export const fetchCategories = createAsyncThunk(
  "categorie/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_ENDPOINTS.CATEGORIES.ALL, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {

      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const categorieSlice = createSlice({
  name: "categorie",
  initialState: {
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.error = (payload && typeof payload === 'object') ? (payload.message || payload.error || JSON.stringify(payload)) : payload;
      });
  }
});

export default categorieSlice.reducer;
