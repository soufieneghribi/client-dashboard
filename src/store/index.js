import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import '../styles/styles.css';  // Import global styles here
import userReducer from "./slices/user.js"
<<<<<<< HEAD
import categorieReducer from "./slices/categorie.js"
import bannersReducer from "./slices/banners.js"
 import recommendedReducer from "./slices/recommended.js"
 import productReducer from "./slices/product.js"
 import popularReducer from "./slices/Popular.js"
=======

>>>>>>> 06d2071aedc2d640779f181a96887cf7422a4cc9
const store = configureStore({
    reducer: {
        user: userReducer,
        auth: authReducer, // Add reducers here
<<<<<<< HEAD
        categorie:categorieReducer,
        banners:bannersReducer,
        recommended: recommendedReducer,
        product:productReducer,
        popular:popularReducer,
=======
>>>>>>> 06d2071aedc2d640779f181a96887cf7422a4cc9
    },
});

export default store;
