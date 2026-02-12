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
import promotionsReducer from "./slices/promotions"; // ✅ Nouveau slice pour les promotions
import loyaltyCardReducer from './slices/loyaltyCardSlice';  // ✅ NOUVEAU
import CodePromoReducer from './slices/CodePromo';  // ✅ NOUVEAU - Codes promo partenaires
import wishlistReducer from './slices/wishlist';  // ✅ NOUVEAU - Wishlist/Favoris
import deliveryReducer from './slices/delivery';  // ✅ NOUVEAU - Delivery fee calculation
import storesReducer from './slices/stores';  // ✅ NOUVEAU - Stores/Relay points
import complaintsReducer from './slices/complaints';  // ✅ NOUVEAU - Réclamations
import creditReducer from './slices/credit';  // ✅ NOUVEAU - Crédit
import blogReducer from './slices/blog';  // ✅ NOUVEAU - Blog/Presse
import recruitmentReducer from './slices/recruitment';  // ✅ NOUVEAU - Recrutement



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
        deals: dealsReducer,
        loyaltyCard: loyaltyCardReducer,  // ✅ NOUVEAU
        promotions: promotionsReducer, // ✅ Nouveau reducer pour les promotions
        codePromo: CodePromoReducer,  // ✅ NOUVEAU - Codes promo partenaires
        wishlist: wishlistReducer,  // ✅ NOUVEAU - Wishlist/Favoris
        delivery: deliveryReducer,  // ✅ NOUVEAU - Delivery fee calculation
        stores: storesReducer,  // ✅ NOUVEAU - Stores/Relay points
        complaints: complaintsReducer,  // ✅ NOUVEAU - Réclamations
        credit: creditReducer,  // ✅ NOUVEAU - Crédit
        blog: blogReducer,  // ✅ NOUVEAU - Blog/Presse
        recruitment: recruitmentReducer,  // ✅ NOUVEAU - Recrutement

    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }).concat(authMiddleware), // Ajout du middleware d'authentification
});

export default store;
