import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import '../styles/styles.css';  // Import global styles here
import userReducer from "./slices/user.js"
import categorieReducer from "./slices/categorie.js"
import bannersReducer from "./slices/banners.js"
 import recommendedReducer from "./slices/recommended.js"
 import productReducer from "./slices/product.js"
 import popularReducer from "./slices/Popular.js"
const store = configureStore({
    reducer: {
        user: userReducer,
        auth: authReducer, // Add reducers here
        categorie:categorieReducer,
        banners:bannersReducer,
        recommended: recommendedReducer,
        product:productReducer,
        popular:popularReducer,
    },
});

export default store;
