import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchProduct= createAsyncThunk("product/fetchProduct", async(id_type, { rejectWithValue }) => {
    try {
        const response = await axios.get(
       `https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/products/type/${id_type}`
      ); 
      return response.data; 
    } catch (error) {
      console.error("Error fetching products:", error);
    }
})
export const fetchProductById= createAsyncThunk("product/fetchProductById", async(idProduct, { rejectWithValue }) => {
  try {
      const response = await axios.get(
     `https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/products/product/${idProduct}`
    ); 
    return response.data; 
  } catch (error) {
    console.error("Error fetching products:", error);
  }
})
export const fetchAllProduct= createAsyncThunk("product/fetchAllProduct", async(_, { rejectWithValue }) => {
  try {
      const response = await axios.get(
     `https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/products/allproducts`
    ); 
    return response.data; 
  } catch (error) {
    console.error("Error fetching products:", error);
  }
})


const productSlice = createSlice({
    name: "product",
    initialState: { 
        product:[],
        loading:null,
        error:null,
    },
    extraReducers:(builder)=>{
      /////////////////fetch product par type {popular or recommanded}/////////
        builder.addCase(fetchProduct.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
        builder.addCase(fetchProduct.fulfilled, (state, action) => {
            state.loading = false;
            state.product= action.payload;
           })
        builder.addCase(fetchProduct.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
           })
           ///////////fetch product by id ///////////
        builder.addCase(fetchProductById.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
        builder.addCase(fetchProductById.fulfilled, (state, action) => {
            state.loading = false;
            state.product= action.payload;
           })
        builder.addCase(fetchProductById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
           })
           ////////// fetch All products ////////////
        builder.addCase(fetchAllProduct.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
        builder.addCase(fetchAllProduct.fulfilled, (state, action) => {
            state.loading = false;
            state.product= action.payload;
           })
        builder.addCase(fetchAllProduct.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
           })
        

    },
})
export default productSlice.reducer;
