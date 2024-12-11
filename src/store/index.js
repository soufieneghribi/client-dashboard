import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import '../styles/styles.css';  // Import global styles here
import userReducer from "./slices/user.js"

const store = configureStore({
    reducer: {
        user: userReducer,
        auth: authReducer, // Add reducers here
    },
});

export default store;
