import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

export const fetchPopular = createAsyncThunk(
    "popular/fetchPopular", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(
        "https://tn360-lqd25ixbvq-ew.a.run.app/api/v1/products/popular"
      ); 
      return response.data; 
    } catch (error) {
      console.error("Error fetching products:", error);
    }
});

const popularSlice= createSlice({
    name:"popular",
    initialState:{
        popular:[],
        loading:null,
        error:null,
    },
    reducers:{},
    extraReducers:(builder)=>{
         builder.addCase(fetchPopular.pending, (state) => {
                state.loading = true;
                state.error = null;
              })
              builder.addCase(fetchPopular.fulfilled, (state, action) => {
                state.loading = false;
                state.popular = action.payload;
              })
              builder.addCase(fetchPopular.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
              })

    }
})
export default popularSlice.reducer;