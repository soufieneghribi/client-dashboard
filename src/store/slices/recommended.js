import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

export const fetchRecommendedProduct = createAsyncThunk(
    "recommended/fetchRecommendedProduct", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(
        "https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/products/recommended"
      ); 
      return response.data; 
    } catch (error) {
      console.error("Error fetching products:", error);
    }
});

const recommendedSlice= createSlice({
    name:"recommended",
    initialState:{
        recommended:[],
        loading:null,
        error:null,
    },
    reducers:{},
    extraReducers:(builder)=>{
         builder.addCase(fetchRecommendedProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
              })
              builder.addCase(fetchRecommendedProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.recommended = action.payload;
              })
              builder.addCase(fetchRecommendedProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
              })

    }
})
export default recommendedSlice.reducer;