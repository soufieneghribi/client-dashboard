import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import '../styles/styles.css';  // Import global styles here
import userReducer from "./slices/user.js"
import categorieReducer from "./slices/categorie.js"
import bannersReducer from "./slices/banners.js"
 import recommendedReducer from "./slices/recommended.js"
 import productReducer from "./slices/product.js"
 import popularReducer from "./slices/Popular.js"
import dealReducer from "./slices/deal.js"
import frequenceReducer from "./slices/frequence.js"
import offreReducer from "./slices/offre.js"
import anniversaireReducer from "./slices/anniversaire.js";
import dealMarqueReducer from "./slices/dealMarque.js"
import orderReducer from "./slices/order.js"
import searchReducer from "./slices/search.js"
const store = configureStore({
    reducer: {
        user: userReducer,
        auth: authReducer, // Add reducers here
        categorie:categorieReducer,
        banners:bannersReducer,
        recommended: recommendedReducer,
        product:productReducer,
        popular:popularReducer,
        deal:dealReducer,
        frequence:frequenceReducer,
        offre:offreReducer,
        anniversaire:anniversaireReducer,
        marque:dealMarqueReducer,
        order:orderReducer,
        search:searchReducer,
        

    },
});

export default store;