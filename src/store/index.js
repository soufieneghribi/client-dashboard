import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import '../styles/styles.css';  // Import global styles here
import userReducer from "./slices/user.js"
import categorieReducer from "./slices/categorie.js"
import bannersReducer from "./slices/banners.js"
import recommendedReducer from "./slices/recommended.js"
import productReducer from "./slices/product.js"
import popularReducer from "./slices/Popular.js"
import frequenceReducer from "./slices/frequence.js"
import offreReducer from "./slices/offre.js"
import anniversaireReducer from "./slices/anniversaire.js";
import orderReducer from "./slices/order.js"
import searchReducer from "./slices/search.js"
import recipesReducer from "./slices/recipes"; // Ajoutez cette ligne
import dealsReducer from "./slices/deals"; // au lieu de deal.js


// Import du middleware d'authentification
import { authMiddleware } from "./slices/authSlice";

const store = configureStore({
    reducer: {
        user: userReducer,
        auth: authReducer, // Add reducers here
        categorie: categorieReducer,
        banners: bannersReducer,
        recommended: recommendedReducer,
        product: productReducer,
        popular: popularReducer,
        frequence: frequenceReducer,
        offre: offreReducer,
        anniversaire: anniversaireReducer,
        order: orderReducer,
        search: searchReducer,
            recipes: recipesReducer,
    deals: dealsReducer

    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }).concat(authMiddleware), // Ajout du middleware d'authentification
});

export default store;