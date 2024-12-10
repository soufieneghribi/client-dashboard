import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import '../styles/styles.css';  // Import global styles here


const store = configureStore({
    reducer: {
        auth: authReducer, // Add reducers here
    },
});

export default store;
