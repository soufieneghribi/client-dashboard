import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axios from "axios";
import { API_ENDPOINTS } from "../../services/api";

export const fetchBanners = createAsyncThunk(
  "banners/fetchBanners",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_ENDPOINTS.BANNERS.ALL);
      console.log("📢 Banners API Response:", response.data);
      console.log("📢 Number of banners received:", Array.isArray(response.data) ? response.data.length : "Not an array");
      return response.data;
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Erreur lors du chargement des bannières.");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const bannerSlice = createSlice({
  name: "banners",
  initialState: {
    banners: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBanners.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBanners.fulfilled, (state, action) => {
      state.loading = false;
      state.banners = action.payload;
    });
    builder.addCase(fetchBanners.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export default bannerSlice.reducer;