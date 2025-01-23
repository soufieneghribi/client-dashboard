
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";

export const fetchCategories = createAsyncThunk(
    "categorie/fetchCategories", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(
        "https://tn360-122923924979.europe-west1.run.app/api/v1/categories/article-types"
      ); 
      return response.data; 
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
});

const categorieSlice = createSlice({
  name: "categorie",
  initialState: {
     categories:[],
     loading: false, // Track loading state
     error: null, // Track error message
   },
   reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      builder.addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      builder.addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  }

})
export default categorieSlice.reducer;