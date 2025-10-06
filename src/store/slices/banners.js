import { createSlice , createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axios from "axios";

export const fetchBanners=createAsyncThunk("banners/fetchBanners", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(
        "https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/banners/get-all"
      ); 
      return response.data; 
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
})


const  bannerSlice = createSlice({
    name: "banners",
    initialState:{
        banners:[],
        loading: false,
        error:false,
    },
    reducers:{},
    extraReducers: (builder) => {
        builder.addCase(fetchBanners.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          builder.addCase(fetchBanners.fulfilled, (state, action) => {
            state.loading = false;
            state.banners = action.payload;
          })
          builder.addCase(fetchBanners.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
      }
})
export default bannerSlice.reducer;